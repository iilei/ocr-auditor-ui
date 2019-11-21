// see https://github.com/swagger-api/swagger-ui/blob/master/docs/customization/plugin-api.md
// for inspirations
import Konva from 'konva';
import DocLoader from '../docLoader';

export interface Plugin {
  context: 'canvas' | 'wrapper';
  fn: PluginPromiseFactory;
}

export type PluginPromiseFactory = (options: Record<string, any>) => Promise

export interface Options {
  stageNode: Konva.Stage;
  doc: DocLoader;
  plugins: Array<Plugin>;
}

export interface Dimensions {
  width: number;
  height: number;
}
