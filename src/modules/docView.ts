import Konva from 'konva';
import DocLoader from './docLoader';

import { traverseFactory, bboxToKonvaRect } from '../modules';
import { Group } from 'konva/types/Group';
import { ShapeConfig } from 'konva/types/Shape';
import { KonvaNodeComponent } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';

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
  words: {
    bbox: {
      common: {
        strokeWidth: 0,
        opacity: 0,
        lineJoin: 'round',
        cornerRadius: 3,
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
};

const blankNode = new Konva.Rect({ visible: false });

class DocView {
  _view: Record<string, any>;
  _image: ImgMeta;
  _stage: Konva.Stage;
  _layers: Record<'root', Konva.Layer>;
  _node: Konva.Node;
  _sticky: Konva.Node | null;
  _ready: boolean;
  _delay: number;
  state: Record<string, any>;

  constructor(stageNode: Konva.Stage, doc: DocLoader) {
    const blank = new Konva.Layer();

    const { view } = doc;
    this._view = view;
    this._stage = stageNode;
    this._layers = { root: blank };
    this._node = blankNode;
    this._sticky = blankNode;
    this._ready = false;
    this._delay = 75;
    this.state = { assumeSecondClick: true };
    this._image = {
      height: 0,
      width: 0,
    };

    return this;
  }

  init = (callback: Function) => {
    this._layers.root.clear();
    this._layers.root.on('click', this.clickHandler);

    this.loadImage(callback);
  };

  onExternalReady = () => {
    // indicate the stage is ready
  };

  clickHandler = (event: KonvaEventObject<MouseEvent>) => {
    const possiblyDoubleClick = setTimeout(() => {
      if (event.evt.detail === 1 && this.state.assumeSecondClick) {
        // it is assured no click happened within the last 330 ms
        this._sticky && this._sticky.opacity(0);
        this._layers.root.batchDraw();
      }
      this.setState({ assumeSecondClick: true });
    }, 250);

    if (event.evt.detail === 2) {
      window.clearTimeout(possiblyDoubleClick);
      this.setState({ assumeSecondClick: false });
    }
  };

  setState = (updates: Record<string, any>) => {
    Object.assign(this.state, { ...updates });
  };

  walkThrough = () => {
    this._layers.root.add(new Konva.Group({ id: this._view.id }));
    this._stage.add(this._layers.root);

    var timeout = setTimeout(() => {}, this._delay);

    // TODO make private and rename
    scopeKeys.forEach(key => {
      const operation = (view: ScopeBranch, [key, val]: [string, Array<ScopeBranch & ScopePaint>]) => {
        const parent: Group = this._stage.findOne(`#${view.id}`);

        val.forEach(scope => {
          const group = new Konva.Group({ id: scope.id, name: scope.content });
          Object.entries(scope).forEach(([prop, opts]: [string, any]) => {
            if (groups[key] && prop === 'bbox') {
              const config = groups[key].bbox;
              if (typeof config === 'object') {
                const options: ShapeConfig = {
                  ...bboxToKonvaRect(scope.bbox),
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
                  if (!this._sticky || evt.currentTarget !== this._sticky) {
                    this._node = blankNode;
                    evt.target.setAttrs({ ...config.common });
                    this._layers.root.batchDraw();
                  }
                });
                // sticky
                box.on('dblclick', evt => {
                  clearTimeout(timeout);
                  if (this._sticky && evt.currentTarget !== this._sticky) {
                    // reset sticky, it's gonna be a new node
                    this._sticky.setAttrs({ ...config.common });
                  }
                  this._node = box;
                  evt.target.setAttrs({ ...config.common, ...config.persistent });
                  this._sticky = evt.currentTarget;
                  this._layers.root.batchDraw();
                });

                group.add(box);
              }
            }
          });

          parent.add(group);
        });
      };

      traverseFactory(this._view, operation, key);
    });

    this._layers.root.draw();
  };

  private loadImage = (callback: Function) => {
    const { image } = this._view;
    const group = new Konva.Group({ name: `img ${image}` });
    this._layers.root.add(group);
    const imageObj = new Image();

    imageObj.onload = () => {
      const { naturalHeight: height, naturalWidth: width } = imageObj;
      this._image = {
        height,
        width,
      };
      var img = new Konva.Image({
        x: 0,
        y: 0,
        image: imageObj,
        width,
        height,
      });

      group.add(img);
      this._layers.root.draw();

      this.walkThrough();
      callback(this._image);
    };
    imageObj.src = image;
  };

  get image() {
    return this._image;
  }

  set ready(isReady: boolean | number | undefined | null) {
    this._ready = Boolean(isReady);
    if (isReady) {
      this.onExternalReady();
    }
  }
}

export default DocView;
