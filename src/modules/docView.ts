import Konva from 'konva';
import { get, set, cloneDeep } from 'lodash';
import { Plugin, Options, Dimensions, PluginSystem } from './types/docView';
import { sequentially, eachDeep, filterDeep, mapDeep, reduceDeep, shape } from '../util';

const noop = async function() {};

class DocView {
  _view: Record<'image', string>;
  _stage: Konva.Stage;
  _root: Konva.Layer;
  _img: Konva.Group;
  _plugins: Array<Plugin>;
  _stateCallbacks: Record<string, (state: Record<string, any>) => Promise<void>>;
  state: {
    plugins: Record<string, Record<string, any>>;
  };

  constructor({ stageNode, doc, plugins, pluginOptions }: Options & { pluginOptions: Record<string, any> }) {
    const { view } = doc;
    this._view = view;
    this._stage = stageNode;
    this._root = new Konva.Layer({ id: '_root' });
    this._img = new Konva.Group({ id: '_img' });
    this._root.add(this._img);
    this._stage.add(this._root);
    this._stateCallbacks = {};
    this._plugins = plugins.filter(plugin => plugin.context === 'canvas');
    const baseState = { plugins: { words: { views: [] } } };
    this.state = Object.assign(baseState, { plugins: { ...baseState.plugins, ...pluginOptions } });
    return this;
  }

  init = async () => {
    this.clear();
    const imgLoader = await this.loadImage(this._view.image);
    await this.pluginQueue();
    this._root.fire('initialized', this.state, true);

    return imgLoader;
  };

  pluginOptions = (name: string) => ({
    view: this._view,
    root: this._root,
    stage: this._stage,
    Konva,
    fn: {
      shape,
      eachDeep,
      mapDeep,
      filterDeep,
      reduceDeep,
      cloneDeep,
      set,
      get,
      sequentially,
      getState: () => this.state.plugins[name],
    },
  });

  pluginQueue = async () => {
    await sequentially(
      this._plugins.map(plugin => {
        Object.assign(this._stateCallbacks, { [plugin.name]: plugin.stateCallback || noop });
        return plugin
          .fn(this.pluginOptions(plugin.name))(this.state.plugins[plugin.name] || {})
          .then(result => {
            Object.assign(this.state, { plugins: { ...this.state.plugins, [plugin.name]: result } });
          });
      }),
    );
  };

  clear = () => {
    this._root.clear();
  };

  setState = (state: Record<string, any> = {}) => {
    Object.assign(this.state, state);
    const promises: Array<Promise<void>> = Object.entries(this._stateCallbacks).map(([key, val]) =>
      val(state.plugins[key]),
    );

    return sequentially(promises);
  };

  private loadImage = (url: string) => {
    const imageObj = new Image();

    return new Promise<Dimensions>((resolve, reject) => {
      imageObj.onload = evt => {
        const { naturalHeight: height, naturalWidth: width } = imageObj;
        const imgOpts = {
          x: 0,
          y: 0,
          image: imageObj,
          width,
          height,
        };
        const img = new Konva.Image(imgOpts);

        img.globalCompositeOperation('multiply');

        this._img.add(img);
        this._root.batchDraw();
        Object.assign(this.state, { img: { width, height, url } });
        img.fire('load', imgOpts, true);

        resolve(imgOpts);
      };

      imageObj.onerror = () => reject({ width: 0, height: 0, err: 1 });
      imageObj.onabort = () => reject({ width: 0, height: 0, err: 2 });
      imageObj.src = url;
    });
  };

  get image(): Konva.Image {
    const img = this._img.findOne<Konva.Image>('Image');
    if (!img) {
      return new Konva.Image();
    }

    return img!;
  }
}

export default DocView;
