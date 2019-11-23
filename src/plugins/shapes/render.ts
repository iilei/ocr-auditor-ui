import { cloneDeep } from 'lodash';
import { name, context, tokens } from './_constants';
import { Plugin, PluginSystem } from '../../modules/types/docView';
import { leftRight as distributeGaps } from './distributeGaps';

const render: Plugin = {
  context,
  name,
  fn: <PluginPromiseFactory>(opts: PluginSystem) =>
    new Promise((resolve, reject) => {
      try {
        const { view, fn, root, Konva } = opts;
        // TODO use https://deepdash.io/#reducedeep so that the new dimensions / offset is taken into acount upon each traversal
        fn.mapDeep(
          cloneDeep(view),
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
                prev = bulk[index - 1].bbox;
              }
              // TBD align left Boundary with outer ?
              if (index < bulk.length - 1) {
                next = bulk[index + 1].bbox;
              }
              // TBD align right Boundary with outer ?
              const bboxOptions = {
                outerBox: fn.shape.bbox(outerBox),
                innerBox: fn.shape.bbox(innerBox),
                prev: prev && fn.shape.bbox(prev),
                next: next && fn.shape.bbox(next),
              };

              const box = distributeGaps(bboxOptions, { snapLeft: true }).innerBox;

              // TODO; configurable paintable boxes
              if (ctx.childrenPath === 'words') {
                root.add(new Konva.Rect({ ...box, fill: 'orange', opacity: 0.3 }));
              }

              return Object.assign(child, { ...child, bbox: fn.shape.bboxReverse(box) });
            }
          },
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
