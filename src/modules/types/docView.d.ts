// see https://github.com/swagger-api/swagger-ui/blob/master/docs/customization/plugin-api.md
// for inspirations
import Konva from 'konva';
import { cloneDeep, get, set } from 'lodash';

import DocLoader from '../docLoader';
import { eachDeep, filterDeep, mapDeep, reduceDeep, shape } from '../../util';

export interface Plugin {
  context: 'canvas' | 'wrapper';
  name: string;
  fn: PluginPromiseFactory;
  init: Function;
  stateCallback?: (state: Record<string, any>) => Promise<void>;
}

export interface PluginSystem {
  view: Record<string, any>;
  root: Konva.Layer;
  stage: Konva.Stage;
  pluginOptions?: Record<string, any>;
  fn: {
    shape: typeof shape;
    eachDeep: typeof eachDeep;
    mapDeep: typeof mapDeep;
    reduceDeep: typeof reduceDeep;
    filterDeep: typeof filterDeep;
    get: typeof get;
    set: typeof set;
    cloneDeep: typeof cloneDeep;
    sequentially: (promises: Array<Promise>) => void;
    getState: () => Record<string, any>;
  };
  Konva: Konva;
}

export type PluginPromiseFactory = (pluginSystem: PluginSystem) => (options: Record<string, any>) => Promise<unknown>;

export interface Options {
  stageNode: Konva.Stage;
  doc: DocLoader;
  plugins: Array<Plugin>;
}

export interface Dimensions {
  width: number;
  height: number;
}
