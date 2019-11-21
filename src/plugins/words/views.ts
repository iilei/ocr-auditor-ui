import { name, context }  from './_constants'
import { Plugin, PluginSystem } from '../../modules/types/docView';

const views: Plugin = {
  context,
  name,
  fn: <PluginPromiseFactory>(opts: PluginSystem) =>
    new Promise((resolve, reject) => {
      try {
        const { view, fn } = opts;
        const views: Array<Record<string, any>> = [];
        fn.traverse(
          view,
          (obj: Record<string, any>) => {
            views.push(obj);
            return obj;
          },
          'words[*]',
        );
        fn.setState({ views });
        resolve(opts);
      } catch (e) {
        reject(new Error(e));
      }
    }),
};

export default views;
