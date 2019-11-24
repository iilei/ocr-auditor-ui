import { cloneDeep } from 'lodash';
import { name, context, tokens } from './_constants';
import { Plugin, PluginSystem } from '../../modules/types/docView';

// @ts-ignore
let views: Plugin = {
  context,
  name,
  fn: <PluginPromiseFactory>(pluginSystem: PluginSystem) => {
    const {
      view,
      fn: { eachDeep },
    } = pluginSystem;
    views.init = () => {
      const clonedView = cloneDeep(view);

      return new Promise((resolve, reject) => {
        try {
          const words: Array<Record<string, any>> = [];
          eachDeep(
            clonedView,
            (child: Record<string, any>, i: number, parent: Record<string, any>, ctx: Record<string, any>) => {
              if (ctx.parent && ctx.parent.path && ctx.childrenPath === name) {
                words.push(child);
              }
            },
            { childrenPath: tokens, includeRoot: true },
          );
          resolve({ views: words });
        } catch (e) {
          reject(new Error(e));
        }
      });
    };

    return (options: Record<string, any>) => views.init(options);
  },
};

export default views;
