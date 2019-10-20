import Konva from 'konva';
import { RefObject } from 'react';
import DocLoader from './docLoader';
import { KonvaNodeEvents, Stage } from 'react-konva';

export type ImgMeta = {
  width: number;
  height: number;
};

class DocView {
  _record: Record<string, any>;
  _view: Record<string, any>;
  _image: ImgMeta;
  _stage: Stage;

  constructor(stageNode: RefObject<any>, doc: DocLoader) {
    const { view, record } = doc;
    this._record = record;
    this._view = view;
    this._stage = stageNode.current;
    this._image = {
      height: 0,
      width: 0,
    };

    return this;
  }

  init = () => {};

  loadImage = (callback: Function) => {
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

      callback(this._image);
    };
    imageObj.src = image;
  };

  get image() {
    return this._image;
  }
}

export default DocView;
