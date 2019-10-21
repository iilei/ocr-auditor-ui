import Konva from 'konva';
import { RefObject } from 'react';
import DocLoader from './docLoader';
import { KonvaNodeEvents, Stage } from 'react-konva';

import { traverseFactory } from '../modules';

const propNames = ['careas', 'pars', 'lines', 'words'];

const groups: Record<string, Array<any>> = {};
propNames.forEach((prop: string) => Object.assign(groups, { [prop]: [] }));

export type ImgMeta = {
  width: number;
  height: number;
};

class DocView {
  _record: Record<string, any>;
  _view: Record<string, any>;
  _image: ImgMeta;
  _stage: Stage;
  _groups: Record<string, Array<any>>;
  _layers: Record<string, Konva.Layer>;

  constructor(stageNode: RefObject<any>, doc: DocLoader) {
    const { view, record } = doc;
    this._record = record;
    this._view = view;
    this._stage = stageNode.current;
    this._groups = groups;
    this._image = {
      height: 0,
      width: 0,
    };

    this._layers = {};

    return this;
  }

  init = (callback: Function) => {
    Object.keys(this._layers).forEach(key => {
      this._layers[key].clear();
    });
    this._groups = groups;

    this.loadImage(callback);
  };

  walkThrough = () => {
    // TODO make private

    const toGroups = (collection: Record<string, any>) => {
      const current = propNames.shift();
      const traverseFunc = (_obj: Record<string, any>) => {
        Object.entries(_obj).forEach(([key, val]) => {
          if (val && typeof val === 'object') {
            traverseFunc(val);
          }
          if (current === key) {
            this._groups[current].push(val);
          }
        });
      };
      traverseFunc(collection);
      if (propNames.length) {
        toGroups(collection);
      }
    };
    toGroups({ ...this._view });

    const [stage_lb, stage_rt] = this._view.bbox;

    const bboxToRectProps = (bbox: any) => {
      const [lb, rt] = bbox;
      const [x0, y0] = lb;
      const [x1, y1] = rt;

      return {
        height: y1 - y0,
        width: x1 - x0,
        x: x0,
        y: y0,
      };
    };

    Object.entries(this._groups).map(([name, collection]) => {
      const layer = new Konva.Layer();
      this._layers[name] = layer;
      collection.forEach(subset => {
        const group = new Konva.Group({});

        // subset is another array
        subset.forEach((obj: Record<string, any>) => {
          if (obj.bbox) {
            const [xy, yx] = obj.bbox;
            // TODO use tilt based on baseline
            var box = new Konva.Rect({
              ...bboxToRectProps(obj.bbox),
              name: obj.id,
              fill: 'orange',
              opacity: 0.1,
              stroke: 'black',
              strokeWidth: 4,
            });

            group.add(box);
            this._layers[name].add(group);
          }
        });
      });
      // @ts-ignore
      this._stage.add(layer);
    });
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
