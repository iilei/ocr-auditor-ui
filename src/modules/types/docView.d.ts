// see https://github.com/swagger-api/swagger-ui/blob/master/docs/customization/plugin-api.md
// for inspirations
import Konva from 'konva';
import DocLoader from '../docLoader';

export interface PluginSystem {}

export interface PluginSystem {
  fn: Record<string, (options: Record<string, any>) => void | any>;
}

export interface PluginInterface {}

export type Plugin = (config: PluginSystem) => PluginInterface;

export interface Options {
  stageNode: Konva.Stage;
  doc: DocLoader;
  plugins: Array<Plugin>;
}

export interface Dimensions {
  width: number;
  height: number;
}
