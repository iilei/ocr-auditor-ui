// see https://github.com/swagger-api/swagger-ui/blob/master/docs/customization/plugin-api.md
// for inspirations
import Konva from 'konva';
import DocLoader from '../docLoader';
import shape from '../../util/shape';
import { traverseFactory } from '../../util';

export interface Plugin {
  context: 'canvas' | 'wrapper';
  name: string;
  fn: PluginPromiseFactory;
}

export interface PluginSystem {
  view: Record<string, any>;
  root: Konva.Layer;
  fn: {
    shape: typeof shape;
    traverseFactory: typeof traverseFactory;
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
