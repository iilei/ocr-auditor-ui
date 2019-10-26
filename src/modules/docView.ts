import Konva from 'konva';
import DocLoader from './docLoader';

import { traverseFactory, bboxToKonvaRect } from '../modules';
import { Group } from 'konva/types/Group';
import { ShapeConfig } from 'konva/types/Shape';
import { KonvaNodeComponent } from 'react-konva';

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
  bbox?: ShapeConfig;
};

const groups: { [k: string]: { bbox?: ScopePaint['bbox'] } } = {
  careas: {
    bbox: {
      stroke: 'rgba(255, 152, 0, .7)',
      strokeWidth: 1,
      opacity: 0,
      lineJoin: 'round',
      cornerRadius: 2,
    },
  },
  pars: {
    bbox: {
      stroke: 'rgba(0, 188, 212, .7)',
      strokeWidth: 1,
      opacity: 0,
      lineJoin: 'round',
      cornerRadius: 2,
    },
  },
  lines: {
    bbox: {
      stroke: 'rgba(0, 188, 212, .7)',
      strokeWidth: 1,
      opacity: 0,
      lineJoin: 'round',
      cornerRadius: 2,
    },
  },
  words: {
    bbox: {
      stroke: 'rgba(0, 188, 212, .7)',
      strokeWidth: 4,
      opacity: 0,
      lineJoin: 'round',
      cornerRadius: 2,
      hitStrokeWidth: 16,
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
  _layers: Record<'root' | 'image', Konva.Layer>;
  _node: Konva.Node;
  _ready: boolean;
  _delay: number;

  constructor(stageNode: Konva.Stage, doc: DocLoader) {
    const blank = new Konva.Layer();

    const { view } = doc;
    this._view = view;
    this._stage = stageNode;
    this._layers = { root: blank, image: blank };
    this._node = blankNode;
    this._ready = false;
    this._delay = 75;
    this._image = {
      height: 0,
      width: 0,
    };

    return this;
  }

  init = (callback: Function) => {
    this._layers.root.clear();

    this.loadImage(callback);
  };

  onExternalReady = () => {
    // indicate the stage is ready
  };

  walkThrough = () => {
    this._layers.root = new Konva.Layer();
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
              const potentialConfig = groups[key][prop];
              if (typeof potentialConfig === 'object') {
                const options: ShapeConfig = {
                  ...bboxToKonvaRect(scope.bbox),
                  ...potentialConfig,
                };
                const box = new Konva.Rect(options);
                box.on('mouseover', evt => {
                  this._node = box;
                  timeout = setTimeout(() => {
                    evt.target.opacity(1);
                    this._layers.root.draw();
                  }, this._delay);
                });
                box.on('mouseout', evt => {
                  clearTimeout(timeout);
                  this._node = blankNode;
                  evt.target.opacity(0);
                  this._layers.root.draw();
                });

                group.add(box);
              }
            }
          });
          // To get dimensions of paragraphs, use group.getClientRect()

          parent.add(group);
        });
      };

      traverseFactory(this._view, operation, key);
    });

    this._layers.root.draw();
  };

  private loadImage = (callback: Function) => {
    const { image } = this._view;
    const layer = new Konva.Layer();
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

      layer.add(img);
      layer.batchDraw();
      this._stage.add(layer);
      this._layers.image = layer;

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
