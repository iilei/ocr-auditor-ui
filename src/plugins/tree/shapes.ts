import { name, context, tokens } from './_constants';
import { Plugin, PluginSystem } from '../../modules/types/docView';

const shapes: Plugin = {
  context,
  name,
  fn: <PluginPromiseFactory>(opts: PluginSystem) =>
    new Promise((resolve, reject) => {
      const {
        view,
        fn: {
          traverseFactory,
          shape: { bbox },
          setState,
        },
      } = opts;
      // prepare scaffolding obj
      const shapes: Record<string, Array<Record<string, any>>> = tokens.reduce((acc, cur) => {
        return { ...acc, [cur]: [] };
      }, {});
      tokens.forEach(token => {
        traverseFactory(
          view,
          (obj: Record<string, any>) => {
            shapes[token].push(obj);
            const rectOpts = bbox(obj.bbox);
            return obj;
          },
          `${token}[*]`,
        );
      });

      setState({ shapes, tokens });
      resolve(opts);
    }),
};

export default shapes;
