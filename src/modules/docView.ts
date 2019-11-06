import Konva from 'konva';
import DocLoader from './docLoader';

import { traverseFactory, bboxToKonvaRect } from '../modules';
import { Group } from 'konva/types/Group';
import { ShapeConfig } from 'konva/types/Shape';
// @ts-ignore
import colorBetween from 'color-between';

const MIN_THICKNESS = 4;
const SNAP_FACTOR = 4;

// TODO how to get this dry?
const scopeKeys = ['careas', 'pars', 'lines', 'words'];
type ScopeKeys = 'careas' | 'pars' | 'lines' | 'words';

type Scope = {
  id: string;
  lang?: string;
  content?: string;
};

type DocMeta = {
  contentType: string;
  ocrCapabilities: string;
  ocrSystem: string;
};

type FontObj = {
  family: string;
  variants: Array<string>;
};

type ScopeBranch = {
  [K in ScopeKeys]?: Array<Scope>;
} &
  Scope;

type BoxPaint = {
  fill?: string;
  opacity?: number;
  stroke?: string;
};

type ScopePaint = {
  bbox: {
    common: ShapeConfig;
    temporary: ShapeConfig;
    persistent: ShapeConfig;
  };
};

const groups: { [k: string]: { bbox: ScopePaint['bbox'] } } = {
  careas: {
    bbox: {
      common: {
        strokeWidth: 0,
        opacity: 0,
        lineJoin: 'round',
        cornerRadius: 2,
      },
      temporary: {
        stroke: 'rgba(146, 204, 101, .35)',
        strokeWidth: 2,
        opacity: 1,
      },
      persistent: {
        fill: 'rgba(146, 204, 101, .35)',
        opacity: 1,
      },
    },
  },
  pars: {
    bbox: {
      common: {
        strokeWidth: 0,
        opacity: 0,
        lineJoin: 'round',
        cornerRadius: 2,
      },
      temporary: {
        stroke: 'rgba(255, 152, 0, .35)',
        strokeWidth: 2,
        opacity: 1,
      },
      persistent: {
        fill: 'rgba(255, 152, 0, .35)',
        opacity: 1,
      },
    },
  },
  lines: {
    bbox: {
      common: {
        strokeWidth: 0,
        opacity: 0,
        lineJoin: 'round',
        cornerRadius: 2,
      },
      temporary: {
        stroke: 'rgba(156, 39, 176, .35)',
        strokeWidth: 2,
        opacity: 1,
      },
      persistent: {
        fill: 'rgba(156, 39, 176, .35)',
        opacity: 1,
      },
    },
  },
  words: {
    bbox: {
      common: {
        strokeWidth: 0,
        opacity: 0,
        lineJoin: 'round',
        cornerRadius: 1,
        hitStrokeWidth: 16,
      },
      temporary: {
        stroke: 'rgba(20, 188, 212, .35)',
        strokeWidth: 2,
        opacity: 1,
      },
      persistent: {
        fill: 'rgba(20, 188, 212, .35)',
        opacity: 1,
      },
    },
  },
};

export type ImgMeta = {
  width: number;
  height: number;
  err: number;
};

const blankNode = new Konva.Rect({ visible: false });

class DocView {
  _font: FontObj;
  _view: Record<string, any>;
  _stage: Konva.Stage;
  _layers: Record<'root', Konva.Layer>;
  _node: Konva.Node;
  _img: Konva.Group;
  _sticky: Konva.Group | null;
  _ready: boolean;
  _delay: number;
  _colorStops: Array<[number, string, string]>;
  _refs: Record<ScopeKeys | 'xWconfs', Array<Konva.Group>>;
  state: Record<string, any>;

  constructor(stageNode: Konva.Stage, doc: DocLoader) {
    const blank = new Konva.Layer();
    const { view } = doc;
    this._view = view;
    this._stage = stageNode;
    this._layers = { root: blank };
    this._node = blankNode;
    this._sticky = null;
    this._ready = false;
    this._delay = 75;
    this._font = { family: 'Verdana', variants: ['regular'] };
    this.state = { assumeSecondClick: true };
    const group = new Konva.Group({ name: 'img' });
    this._layers.root.add(group);
    this._img = group;
    this._colorStops = [
      // [30, 'rgb(255,0,233)', 'rgb(255,96,0)'],
      // [90, 'rgb(255,96,0)', 'rgb(255,253,0)'],
      [100, 'rgb(255,28,0)', 'rgb(64,168,0)'],
    ];
    this._refs = {
      careas: [],
      pars: [],
      lines: [],
      words: [],
      xWconfs: [],
    };

    return this;
  }

  init = () => {
    this._layers.root.clear();

    return this.loadImage().then((dimensions: { width: number; height: number }) => {
      this.walkThrough();
      this.keyLog();
      this._ready = true;
      return dimensions;
    });
  };

  setFont = (font: FontObj) => {
    this._font = font;
    const { family } = font;
    const [variant] = font.variants;
    console.log(variant, family);
  };

  layers = async ({ confidence }: { confidence: boolean }) => {
    const confidenceLayer: Group = this._stage.findOne(`#${this._view.id}_xWconf`);
    confidenceLayer.visible(confidence);
    this._layers.root.batchDraw();
    return confidence;
  };

  colorStops = (confidence: number): [string, string] => {
    return (
      this._colorStops
        // @ts-ignore
        .map<[string, string]>(([max, start, stop], idx) => {
          if (
            confidence <= max &&
            (idx == 0 || (this._colorStops[idx - 1] && this._colorStops[idx - 1][0] < confidence))
          ) {
            return [start, stop];
          }
        })
        .find(Boolean)
    );
  };

  confidenceColor = (confidence: number) => colorBetween(...this.colorStops(confidence), confidence * 0.01, 'rgb');

  snappyBox = (bondary: any, unbound: any, factor: number, outset: number = 0) => {
    const { height: bHeight, y: bY } = bondary;
    const height = Math.ceil(Math.max(Math.ceil(bHeight * factor), MIN_THICKNESS) / SNAP_FACTOR) * SNAP_FACTOR;
    const y = bHeight + bY - height;
    const [lb, rt] = unbound;
    const [x0] = lb;
    const [x1] = rt;
    const width = x1 - x0;
    const x = x0;
    return {
      height,
      width,
      x,
      y: Math.ceil(y + outset * height),
    };
  };

  tabSelect = (reverse = false) => {
    let nextStickyIndex;
    const wordCount = this._refs.words.length;
    // shift-tab -> previous word
    if (!this._sticky) {
      // assign first / last node to selection
      nextStickyIndex = reverse ? wordCount - 1 : 0;
    } else {
      const {
        attrs: { id: curId },
      } = this._sticky;
      const stickyIndex = this._refs.words.findIndex(({ attrs: { id } }) => id === curId);
      if (stickyIndex === wordCount - 1 && !reverse) {
        nextStickyIndex = 0;
      } else if (stickyIndex === 0 && reverse) {
        nextStickyIndex = wordCount - 1;
      } else {
        nextStickyIndex = (stickyIndex + (reverse ? -1 : 1)) % wordCount;
      }
    }
    if (this._sticky) {
      this._sticky.findOne('Rect').setAttrs(groups.words.bbox.common);
    }
    this._layers.root.batchDraw();
    this._refs.words[nextStickyIndex].findOne('Rect').fire('dblclick', {}, true);
  };

  keyLog = () => {
    const container = this._stage.container();

    container.addEventListener(
      'keydown',
      event => {
        const { shiftKey, defaultPrevented, key, altKey } = event;
        if (defaultPrevented) {
          return; // Do nothing if the event was already processed
        }

        switch (key) {
          case 'Tab':
            // Do something for "down arrow" key press.
            // double-tab to leave the stage
            // single tab to go to next word
            this.tabSelect(shiftKey);
            break;
          case 'Esc': // IE/Edge specific value
          case 'Escape':
            // Do something for "esc" key press.
            break;
          default:
            console.log(key);
            return; // Quit when this doesn't handle the key event.
        }

        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
      },
      true,
    );
  };

  setState = (updates: Record<string, any>) => {
    Object.assign(this.state, { ...updates });
  };

  walkThrough = () => {
    this._layers.root.add(new Konva.Group({ id: `${this._view.id}_xWconf` }));
    this._layers.root.add(new Konva.Group({ id: this._view.id }));
    this._stage.add(this._layers.root);

    const possiblySnappyBox = (parentClientRect: any, bbox: ScopePaint['bbox'], key: string) => {
      if (key === 'words') {
        return this.snappyBox(parentClientRect, bbox, 1, 0);
      } else {
        return bboxToKonvaRect(bbox);
      }
    };

    let timeout = setTimeout(() => {}, 0);

    // TODO make private and rename
    scopeKeys.forEach(key => {
      const operation = (view: ScopeBranch, [key, val]: [ScopeKeys, Array<ScopeBranch & ScopePaint>]) => {
        const parent: Group = this._stage.findOne(`#${view.id}`);
        const confParent: Group = this._stage.findOne(`#${view.id}_xWconf`);
        const parentClientRect = parent.getClientRect({});

        val.forEach(scope => {
          const group = new Konva.Group({ id: scope.id, name: scope.content });
          const xWconfGroup = new Konva.Group({ id: `${scope.id}_xWconf`, name: key });

          Object.entries(scope).forEach(([prop, opts]: [string, any]) => {
            if (groups[key] && prop === 'bbox') {
              const config = groups[key].bbox;
              if (typeof config === 'object') {
                const options: ShapeConfig = {
                  ...possiblySnappyBox(parentClientRect, scope.bbox, key),
                  ...config.common,
                };
                const box = new Konva.Rect(options);
                box.globalCompositeOperation('multiply');

                box.on('mouseover', evt => {
                  this._node = box;
                  timeout = setTimeout(() => {
                    evt.target.setAttrs({ ...config.common, ...config.temporary });
                    this._layers.root.batchDraw();
                  }, this._delay);
                });

                box.on('mouseout', evt => {
                  clearTimeout(timeout);
                  if (evt.currentTarget.findAncestor('Group', true) !== this._sticky) {
                    this._node = blankNode;
                    evt.target.setAttrs({ ...config.common });
                    this._layers.root.batchDraw();
                  }
                });

                // sticky
                box.on('dblclick', evt => {
                  const parent: Konva.Group = <Group>evt.currentTarget.findAncestor('Group', true);
                  clearTimeout(timeout);
                  if (parent !== this._sticky && this._sticky) {
                    // reset sticky, it's gonna be a new node
                    this._sticky.findOne('Rect').setAttrs({ ...config.common });
                  }
                  this._node = box;
                  evt.target.setAttrs({ ...config.common, ...config.persistent });
                  this._sticky = parent;
                  this._layers.root.batchDraw();
                });

                group.add(box);

                // render confidence layer
                if (key === 'words') {
                  const optionsConf: ShapeConfig = {
                    ...this.snappyBox(parentClientRect, scope.bbox, 0.2, 0.3),
                    ...config.common,
                    // @ts-ignoreparentClientRect
                    fill: this.confidenceColor(scope.xWconf),
                    opacity: 0.5,
                  };

                  // @ts-ignore
                  if (scope.xWconf) {
                    // @ts-ignore
                    optionsConf.name = `${scope.xWconf ? scope.xWconf : ''}`;
                  }

                  const confBox = new Konva.Rect(optionsConf);
                  confBox.globalCompositeOperation('multiply');
                  xWconfGroup.add(confBox);
                }
              }
            }
          });
          // order matters!
          confParent.add(xWconfGroup);
          parent.add(group);
          this._refs[key].push(group);
          if (key === 'words') {
            this._refs.xWconfs.push(xWconfGroup);
          }
        });
      };

      traverseFactory(this._view, operation, key);
    });

    this._layers.root.on('click', () => {
      this._node = blankNode;
      if (this._sticky) {
        this._sticky.setAttrs({ opacity: 0 });
      }
      this._layers.root.batchDraw();
    });

    this._layers.root.draw();
  };

  highlightById = (highlight: string) => {
    if (!this._ready) {
      throw new Error('Not yet initialized!');
    }
    const box = this._stage.findOne<Konva.Group>(`#${highlight}`);
    this.highlight(box.findOne('Shape'));
  };

  highlight = (box: Konva.Rect) => {
    box.fire('dblclick', {}, true);
  };

  private loadImage = () => {
    const { image } = this._view;
    const imageObj = new Image();

    return new Promise<ImgMeta>((resolve, reject) => {
      imageObj.onload = () => {
        const { naturalHeight: height, naturalWidth: width } = imageObj;
        const img = new Konva.Image({
          x: 0,
          y: 0,
          image: imageObj,
          width,
          height,
        });

        img.globalCompositeOperation('multiply');

        this._img.add(img);
        this._layers.root.draw();

        resolve({
          height,
          width,
          err: 0,
        });
      };

      imageObj.onerror = () => reject({ width: 0, height: 0, err: 1 });
      imageObj.onabort = () => reject({ width: 0, height: 0, err: 2 });
      imageObj.src = image;
    });
  };
}

export default DocView;
