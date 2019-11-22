import { name, context, tokens } from './_constants';
import { Plugin, PluginSystem } from '../../modules/types/docView';

const prepareScaffoldingObj = (tokens: Array<string>): Record<string, Array<Record<string, any>>> =>
  tokens.reduce((acc, cur) => {
    return { ...acc, [cur]: [] };
  }, {});

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
      const shapes = prepareScaffoldingObj(tokens);
      traverseFactory(
        view,
        (obj: Record<string, any>, [key]: [string]) => {
          const boxes = obj[key].map((item: Record<'bbox', Record<string, number>>) => bbox(item.bbox));
          shapes[key].push(...boxes);
          return obj;
        },
        ...tokens,
      );

      setState({ shapes, tokens });
      resolve(opts);
    }),
};

export default shapes;
