import { context, name, tokens } from '../_constants';
import { Plugin, PluginSystem } from '../../modules/types/docView';
import distributeGaps from './distributeGaps';
import snapToOuter from './snapToOuter';
import strokeInset from './strokeInset';
import { confidenceShapeOptions } from './confidenceShapeOptions';

const WORDS_TOKEN = tokens[tokens.length - 1];

// @ts-ignore
let render: Plugin = {
  context,
  name,
  stateCallback: async (options: Record<string, any>) => {
    render.init(options);
  },
  fn: <PluginPromiseFactory>(pluginSystem: PluginSystem) => {
    const {
      view,
      stage,
      fn: { reduceDeep, set, cloneDeep, shape, get },
      root,
      Konva,
    } = pluginSystem;

    render.init = (options: Record<string, any>) => {
      const clonedView = cloneDeep(view);
      const former = stage.findOne(`#${name}`);
      if (former) {
        former.destroy();
      }

      const pluginGroup = new Konva.Group({ id: name });
      root.add(pluginGroup);
      const { confidence, snapOptions: snap } = options;

      return new Promise((resolve, reject) => {
        try {
          reduceDeep(
            clonedView,
            // TODO reuse types
            (
              accumulator: Record<string, any>,
              child: Record<string, any>,
              i: string | number,
              parent: Record<string, any>,
              ctx: Record<string, any>,
            ) => {
              if (ctx.parent) {
                const currentGroup = new Konva.Group({ id: child.id, name: ctx.childrenPath });
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
                const snapOptions = { ...snap, kindOf: ctx.childrenPath };

                // todo - extract mechanism that derives from kindOf whether it is about vertical or horizontal distribution
                const box = distributeGaps(snapToOuter(bboxOptions, snapOptions), snapOptions).innerBox;

                if (ctx.childrenPath === WORDS_TOKEN) {
                  // TODO extract eventListeners
                  currentGroup.addEventListener('dblclick mousedown mouseup', (event: MouseEvent) => {
                    event.stopImmediatePropagation();
                    const box = currentGroup.findOne('.box');
                    const outer = currentGroup.findOne('.outer');
                    const { id, name: groupName } = currentGroup.attrs;

                    const payload = {
                      name: groupName,
                      id,
                      box,
                      outer,
                      path: ctx.path,
                      plugin: name,
                      raw: get(view, ctx.path),
                    };
                    Object.assign(event, { payload });
                  });

                  const confOpts = confidenceShapeOptions(box, confidence, child.xWconf);

                  if (confidence.konvaOptions.visible) {
                    const confShape = new Konva.Rect(confOpts);
                    currentGroup.add(confShape);
                    Object.assign(box, { height: Math.max(box.height - confOpts.height, 0) });
                  }

                  const outerShape = new Konva.Rect({ ...box, ...options.outer, name: 'outer' });
                  currentGroup.add(outerShape);

                  const innerShape = new Konva.Rect(
                    strokeInset({ ...shape.bbox(innerBox), ...options.inner, name: 'box' }),
                  );

                  currentGroup.add(innerShape);
                } else {
                  currentGroup.add(new Konva.Rect({ ...box, name: 'outer' }));
                }

                const parentGroup: typeof Konva.Group = root.findOne(`#${ctx.parent.value.id}`);
                parentGroup.add(currentGroup);

                set(
                  accumulator,
                  ctx.path,
                  Object.assign(child, {
                    ...child,
                    bbox: shape.bboxReverse(box),
                  }),
                );
              } else {
                const currentGroup = new Konva.Group({ id: child.id, name: ctx.childrenPath });
                pluginGroup.add(currentGroup);
              }
              return accumulator;
            },
            clonedView,
            { childrenPath: tokens, includeRoot: true },
          );
          root.batchDraw();
          resolve(pluginGroup);
        } catch (e) {
          reject(new Error(e));
        }
      });
    };
    return (options: Record<string, any>) => render.init(options);
  },
};

export default render;
