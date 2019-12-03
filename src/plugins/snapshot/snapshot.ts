import { context, name } from './_constants';
import { Plugin, PluginSystem } from '../../modules/types/docView';
import Konva from 'konva';
import { tokens } from '../_constants';

const WORDS_TOKEN = tokens[tokens.length - 1];

export type Options = { range: [string]; inRange: Konva.ShapeConfig; outOfRange: Konva.ShapeConfig };

// @ts-ignore
let snapshot: Plugin = {
  context,
  name,
  stateCallback: async options => {
    snapshot.init(options);
  },
  fn: <PluginPromiseFactory>(pluginSystem: PluginSystem) => {
    const {
      Konva,
      stage,
      view,
      root,
      fn: { eachDeep, validateRange },
    } = pluginSystem;

    snapshot.get = (range: Array<string>, cb: Function) => {
      const shapeGroup = stage.findOne('#shapes');

      const pluginGroup = new Konva.Group({
        id: name,
        globalCompositeOperation: 'destination-atop',
      });

      const ids = [...range];

      const isValid = validateRange(ids);
      if (!isValid || !ids.length) {
        return null;
      }

      const result: Array<string> = [];

      eachDeep(
        view,
        (
          value: Record<string, any>,
          key: string | number,
          parentValue: Record<string, any>,
          context: Record<string, any>,
        ) => {
          const { id } = value;
          if (context.childrenPath === WORDS_TOKEN && (ids.includes(id) || ids.length === 1)) {
            if (ids.includes(id)) {
              const count = ids.lastIndexOf(id) + 1 - ids.indexOf(id);
              ids.splice(ids.indexOf(id), count);
            }
            const group: Konva.Group = stage.findOne(`#${id}`);
            // TODO ensure dimensions are represented correctly by assigning a fill color and visible=true temporary
            const attrs: Konva.ShapeConfig = group.getClientRect({});

            const mask = new Konva.Rect({ ...attrs, fill: 'white', opacity: 1, visible: true });
            pluginGroup.add(mask);
            result.push(id);
          }
        },
        { childrenPath: tokens },
      );

      const visibleBefore = shapeGroup.getAttr('visible');

      // TODO set globalCompositeOperation of background image to 'source-over' for the time the snapshot is taken

      shapeGroup.setAttrs({ visible: false });
      // https://stackoverflow.com/questions/52169662/using-globalcompositeoperation-to-mask-group-of-shapes-in-react-konva
      pluginGroup.cache();
      root.add(pluginGroup);
      root.batchDraw();
      const dimensions = pluginGroup.getClientRect();

      const inverse = pluginGroup.clone();
      inverse.setOpacity(1);
      inverse.setGlobalCompositeOperation('xor');
      inverse.cache();

      const inverseGroup = new Konva.Group({ globalCompositeOperation: 'source-over' });
      const inverseMask = new Konva.Rect({
        ...dimensions,
        fill: 'white',
        opacity: 1,
        visible: true,
      });

      inverseGroup.add(inverseMask);
      inverseGroup.add(inverse);

      root.add(inverseGroup);
      inverseGroup.cache();
      pluginGroup.cache();
      root.batchDraw();

      setTimeout(() => {
        // here it is

        stage.toImage({
          ...dimensions,
          callback: image => {
            shapeGroup.setAttr('visible', visibleBefore);
            pluginGroup.destroy();
            inverseGroup.destroy();
            root.batchDraw();
            cb(image.src);
          },
        });
      }, 0);
    };

    snapshot.init = (options: Options) => {
      return new Promise((resolve, reject) => {
        try {
          resolve({});
        } catch (e) {
          reject(new Error(e));
        }
      });
    };

    return (options: Record<string, any>) => snapshot.init(options);
  },
};

export default snapshot;
