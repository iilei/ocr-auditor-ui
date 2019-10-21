import Konva from 'konva';
import { RefObject } from 'react';
import DocLoader from './docLoader';
import { Stage } from 'react-konva';

import { traverseFactory, bboxToKonvaRect } from '../modules';

// TODO how to get this dry?
const scopeKeys = ['careas', 'pars', 'lines', 'words'];
type ScopeKeys = 'careas' | 'pars' | 'lines' | 'words';

type Scope = {
  id: string;
  lang?: string;
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
  bbox?: Konva.RectConfig | Array<number>;
};

const groups: Record<string, Omit<ScopeBranch, 'id'> & ScopePaint> = {
  careas: {
    bbox: {
      stroke: 'orange',
      strokeWidth: 1,
      opacity: 0.3,
    },
  },
  pars: {
    bbox: {
      stroke: 'turquoise',
      strokeWidth: 1,
      opacity: 0.4,
    },
  },
  lines: {
    bbox: {
      fill: 'magenta',
      opacity: 0.15,
    },
  },
  words: {
    bbox: {
      stroke: 'turquoise',
      strokeWidth: 1,
    },
  },
};

export type ImgMeta = {
  width: number;
  height: number;
};

class DocView {
  _view: Record<string, any>;
  _image: ImgMeta;
  _stage: Stage;
  _groups: Record<string, Konva.Group>;
  _layers: Record<string, Konva.Layer>;

  constructor(stageNode: RefObject<any>, doc: DocLoader) {
    const { view } = doc;
    this._view = view;
    this._stage = stageNode.current;
    this._layers = {};
    this._groups = {};
    this._image = {
      height: 0,
      width: 0,
    };
    return this;
  }

  init = (callback: Function) => {
    Object.keys(this._layers).forEach(key => {
      this._layers[key].clear();
    });
    this._groups = {};

    this.loadImage(callback);
  };

  walkThrough = () => {
    const layer = new Konva.Layer();
    layer.add(new Konva.Group({ id: this._view.id }));
    // @ts-ignore
    this._stage.add(layer);

    // TODO make private and rename
    scopeKeys.forEach(key => {
      const operation = (view: ScopeBranch, [key, val]: [string, Array<ScopeBranch & ScopePaint>]) => {
        const groupConfig = groups[key] || {};
        // @ts-ignore
        if (!layer.find(`#${view.id}`).length) {
          layer.add(new Konva.Group({ id: view.id }));
        }

        // @ts-ignore
        const parent = this._stage.find(`#${view.id}`);

        val.forEach(scope => {
          const group = new Konva.Group({ id: scope.id });
          Object.entries(scope).forEach(([prop, opts]: [string, any]) => {
            // @ts-ignore
            if (typeof groupConfig[prop] === 'object') {
              const options = {
                // @ts-ignore
                ...groupConfig[prop],
                ...bboxToKonvaRect(scope.bbox),
              };
              const box = new Konva.Rect(options);
              group.add(box);
            }
          });
          // To get dimensions of paragraphs, use group.getClientRect()
          parent.add(group);
        });
      };

      traverseFactory(this._view, operation, key);
    });

    layer.draw();

    // @ts-ignore
    window.hocView = { ctx: this, layer };
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
      // @ts-ignore
      this._stage.add(layer);
      this._layers.image = layer;

      // TODO activate
      // this.walkThrough();
      callback(this._image);
    };
    imageObj.src = image;
  };

  get image() {
    return this._image;
  }
}

export default DocView;
