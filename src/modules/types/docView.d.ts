// see https://github.com/swagger-api/swagger-ui/blob/master/docs/customization/plugin-api.md
// for inspirations
import Konva from 'konva';
import { get, set, cloneDeep } from 'lodash';

import DocLoader from '../docLoader';
import { filterDeep, eachDeep, mapDeep, reduceDeep, shape } from '../../util';

export interface Plugin {
  context: 'canvas' | 'wrapper';
  name: string;
  fn: PluginPromiseFactory;
}

export interface PluginSystem {
  view: Record<string, any>;
  root: Konva.Layer;
  stage: Konva.Stage;
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
    setState: (state: Record<string, any>) => void;
    getState: () => Record<string, any>;
  };
  Konva: Konva;
}

export type PluginPromiseFactory = (options: PluginSystem) => Promise<PluginSystem>;

export interface Options {
  stageNode: Konva.Stage;
  doc: DocLoader;
  plugins: Array<Plugin>;
}

export interface Dimensions {
  width: number;
  height: number;
}
