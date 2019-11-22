import { name, context, tokens } from './_constants';
import { Plugin, PluginSystem } from '../../modules/types/docView';

const shapes: Plugin = {
  context,
  name,
  fn: <PluginPromiseFactory>(opts: PluginSystem) =>
    new Promise((resolve, reject) => {
      try {
        const { view, fn } = opts;
        fn.eachDeep(
          { ...view },
          // TODO reuse types
          (child: Record<string, any>, i: string, parent: Record<string, any>, ctx: Record<string, any>) => {
            if (ctx.parent) {
              const outerBox = ctx.parent.value.bbox;
              const innerBox = child.bbox;
              const bulk = parent[ctx.childrenPath];
              const index = parseInt(i, 10);
              let prev;
              let next;

              if (index > 0) {
                prev = bulk[index - 1];
              }
              // TBD align left Boundary with outer ?
              if (index < bulk.length - 1) {
                next = bulk[index + 1];
              }
              // TBD align right Boundary with outer ?

              // TODO use next and prev - or outerBox if n/a to determine how to distribute items
            }
          },
          { childrenPath: tokens, includeRoot: true },
        );
        resolve(opts);
      } catch (e) {
        reject(new Error(e));
      }
    }),
};

export default shapes;
