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
        Konva,
        root,
        fn: {
          traverseFactory,
          shape: { bbox },
          setState,
        },
      } = opts;
      // prepare scaffolding objects
      const shapes = prepareScaffoldingObj(tokens);
      const expandedShapes = prepareScaffoldingObj(tokens);

      const boxesExpanded = (innerBboxes, outerBox) => {
        console.log(innerBboxes, outerBox);

        const applyLeftPadding = (acc, cur, idx, src) => {
          const { height, y } = outerBox;
          let adjustedX = cur.x;

          let leftPad = 0;
          if (idx !== 0) {
            const prev = src[idx - 1];
            leftPad = (cur.x - (prev.x + prev.width)) / 2;
            adjustedX = cur.x - leftPad;
          }

          return [...acc, { ...cur, width: cur.width + leftPad, height, x: adjustedX, y }];
        };

        const applyRightPadding = (acc, cur, idx, src) => {
          const { height, y } = outerBox;
          let adjustedWidth = cur.width;
          if (idx < src.length - 1) {
            const next = src[idx + 1];
            adjustedWidth = next.x - cur.x;
          }

          return [...acc, { ...cur, width: adjustedWidth }];
        };
        const expanded = innerBboxes.reduce(applyLeftPadding, []).reduce(applyRightPadding, []);
        return expanded;
      };

      traverseFactory(
        view,
        (obj: Record<string, any>, [key]: [string]) => {
          const boxes = obj[key].map((item: Record<'bbox', Record<string, number>>) => bbox(item.bbox));

          const outerBox = bbox(obj.bbox);
          const innerBboxes = [...boxes];
          const expandedShapeBBoxes = boxesExpanded(innerBboxes, outerBox);

          console.log(outerBox, '*****');

          expandedShapes[key].push(...expandedShapeBBoxes);

          if (key === tokens[tokens.length - 1]) {
            expandedShapeBBoxes.map(box => {
              root.add(new Konva.Rect({ ...box, fill: 'orange', opacity: 0.3 }));
            });
          }

          shapes[key].push(...boxes);
          return obj;
        },
        ...tokens,
      );

      root.batchDraw();

      setState({ shapes, tokens, expandedShapes });
      resolve(opts);
    }),
};

export default shapes;
