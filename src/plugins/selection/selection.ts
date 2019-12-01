import { context, name } from './_constants';
import { Plugin, PluginSystem } from '../../modules/types/docView';
import Konva from 'konva';
import { tokens } from '../_constants';

export type Options = { range: [string]; inRange: Konva.ShapeConfig; outOfRange: Konva.ShapeConfig };

// @ts-ignore
let selection: Plugin = {
  context,
  name,
  stateCallback: async options => {
    selection.init(options);
  },
  fn: <PluginPromiseFactory>(pluginSystem: PluginSystem) => {
    const {
      stage,
      view,
      root,
      fn: { eachDeep },
    } = pluginSystem;

    const boundaryNodes: Array<Konva.Node> = [];

    selection.init = (options: Options) => {
      const nodes: Array<Konva.Node> = [];
      const { range, inRange, outOfRange } = options;

      nodes.push(...stage.find('.words').toArray());
      const validIDs = nodes.map(node => node.attrs.id);

      // @ts-ignore
      const [a, b] = range;
      const ids = [a, b || a].filter(id => validIDs.includes(id));

      const result: Array<string> = [];

      eachDeep(
        view,
        (
          value: Record<string, any>,
          key: string | number,
          parentValue: Record<string, any>,
          context: Record<string, any>,
        ) => {
          const { id } = value;
          if (ids.includes(id) || ids.length === 1) {
            if (ids.includes(id)) {
              const count = ids.lastIndexOf(id) + 1 - ids.indexOf(id);
              ids.splice(ids.indexOf(id), count);
            }

            result.push(id);
            const group: Konva.Group = stage.findOne(`#${id}`);
            const area: Konva.Shape = group.findOne('.outer');
            // @ts-ignore
            area.setAttrs(inRange);
          } else {
            const group: Konva.Group = stage.findOne(`#${id}`);
            const area: Konva.Shape = group.findOne('.outer');
            // @ts-ignore
            area.setAttrs(outOfRange);
          }
        },
        { childrenPath: tokens },
      );

      root.batchDraw();

      return new Promise((resolve, reject) => {
        try {
          resolve({ result });
        } catch (e) {
          reject(new Error(e));
        }
      });
    };

    return (options: Record<string, any>) => selection.init(options);
  },
};

export default selection;
