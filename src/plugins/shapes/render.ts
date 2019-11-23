import { name, context, tokens, defaultOptions, renderOptions } from './_constants';
import { Plugin, PluginSystem } from '../../modules/types/docView';
import distributeGaps from './distributeGaps';
import snapToOuter from './snapToOuter';
import strokeInset from './strokeInset';

const render: Plugin = {
  context,
  name,
  fn: <PluginPromiseFactory>(opts: PluginSystem) =>
    new Promise((resolve, reject) => {
      try {
        const {
          view,
          fn: { reduceDeep, set, cloneDeep, shape },
          root,
          Konva,
        } = opts;

        reduceDeep(
          view,
          // TODO reuse types
          (
            accumulator: Record<string, any>,
            child: Record<string, any>,
            i: string | number,
            parent: Record<string, any>,
            ctx: Record<string, any>,
          ) => {
            if (ctx.parent) {
              const currentGroup = new Konva.Group({ id: child.id });
              const outerBox = ctx.parent.value.bbox;
              const innerBox = child.bbox;
              const bulk = parent[ctx.childrenPath];
              const index = typeof i === 'string' ? parseInt(i, 10) : i;
              let prev;
              let next;

              if (index > 0) {
                prev = bulk[index - 1].bbox;
              }

              if (index < bulk.length - 1) {
                next = bulk[index + 1].bbox;
              }

              const bboxOptions = {
                outerBox: shape.bbox(outerBox),
                innerBox: shape.bbox(innerBox),
                prev: prev && shape.bbox(prev),
                next: next && shape.bbox(next),
              };
              const snapOptions = { ...defaultOptions, kindOf: ctx.childrenPath };
              // todo - extract mechanism that derives from kindOf whether it is about vertical or horizontal distribution
              const box = distributeGaps(snapToOuter(bboxOptions, snapOptions), snapOptions).innerBox;

              // TODO; configurable paint boxes
              if (ctx.childrenPath === 'words') {
                currentGroup.addName(child.content);

                // TODO extract eventListeners
                currentGroup.addEventListener('dblclick', (event: MouseEvent) => {
                  event.stopImmediatePropagation();
                  const box = currentGroup.findOne('.box');
                  const outer = currentGroup.findOne('.outer');
                  const { id, name: content } = currentGroup.attrs;
                  const payload = { content, id, box, outer, path: ctx.path };
                  currentGroup.fire('tokenfocus', { ...event, payload }, true);
                });

                const outerShape = new Konva.Rect({ ...box, ...renderOptions.outer, name: 'outer' });
                currentGroup.add(outerShape);
                const innerShape = new Konva.Rect(
                  strokeInset({ ...shape.bbox(innerBox), ...renderOptions.inner, name: 'box' }),
                );
                currentGroup.add(innerShape);
              } else {
                currentGroup.add(new Konva.Rect({ ...box, name: 'outer' }));
              }

              const parentGroup: typeof Konva.Group = root.findOne(`#${ctx.parent.value.id}`);
              parentGroup.add(currentGroup);

              set(accumulator, ctx.path, Object.assign(child, { ...child, bbox: shape.bboxReverse(box) }));
            } else {
              const currentGroup = new Konva.Group({ id: child.id });
              root.add(currentGroup);
            }
            return accumulator;
          },
          cloneDeep(view),
          { childrenPath: tokens, includeRoot: true },
        );
        root.batchDraw();
        resolve(opts);
      } catch (e) {
        reject(new Error(e));
      }
    }),
};

export default render;
