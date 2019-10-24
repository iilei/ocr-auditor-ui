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
  _stage: Konva.Stage;
  _groups: Record<string, Konva.Group>;
  _layers: Record<string, Konva.Layer>;
  _ready: boolean;

  constructor(stageNode: Konva.Stage, doc: DocLoader) {
    const { view } = doc;
    this._view = view;
    this._stage = stageNode;
    this._layers = {};
    this._groups = {};
    this._ready = false;
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

  onExternalReady = () => {
    // indicate the stage is ready
  };

  walkThrough = () => {
    const layer = new Konva.Layer();
    layer.add(new Konva.Group({ id: this._view.id }));

    this._stage.add(layer);

    this._stage.getStage();

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

    layer.draw();
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
