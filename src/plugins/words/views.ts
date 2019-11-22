import { name, context, tokens } from './_constants';
import { Plugin, PluginSystem } from '../../modules/types/docView';

const views: Plugin = {
  context,
  name,
  fn: <PluginPromiseFactory>(opts: PluginSystem) =>
    new Promise((resolve, reject) => {
      try {
        const { view, fn } = opts;
        const views: Array<Record<string, any>> = [];
        fn.eachDeep(
          { ...view },
          // TODO reuse Types
          (child: Record<string, any>, i: number, parent: Record<string, any>, ctx: Record<string, any>) => {
            if (ctx.parent && ctx.parent.path && ctx.childrenPath === name) {
              views.push(child);
            }
          },
          { childrenPath: tokens, includeRoot: true },
        );
        fn.setState({ views });
        resolve(opts);
      } catch (e) {
        reject(new Error(e));
      }
    }),
};

export default views;
