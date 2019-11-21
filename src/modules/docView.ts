import Konva from 'konva';
import { Plugin, Options, Dimensions } from './types/docView';
import { sequentially, traverse, traverseFactory } from '../util';

class DocView {
  _view: Record<'image', string>;
  _stage: Konva.Stage;
  _root: Konva.Layer;
  _img: Konva.Group;
  _plugins: Array<Plugin>;
  state: {
    plugins: {
      words: {
        views: Array<Record<string, any>>;
      };
    };
  };

  constructor({ stageNode, doc, plugins }: Options) {
    const { view } = doc;
    this._view = view;
    this._stage = stageNode;
    this._root = new Konva.Layer({ id: '_root' });
    this._img = new Konva.Group({ id: '_img' });
    this._root.add(this._img);
    this._stage.add(this._root);
    this._plugins = plugins.filter(plugin => plugin.context === 'canvas');
    this.state = { plugins: { words: {views: []} } };

    return this;
  }

  init = async () => {
    this.clear();
    const imgLoader = await this.loadImage(this._view.image);
    await this.pluginQueue();
    this._stage.fire('initialized', this.state, true)

    return imgLoader;
  };

  pluginQueue = async () => {
    await sequentially(
      this._plugins.map(plugin =>
        plugin.fn({
          view: this._view,
          root: this._root,
          Konva,
          fn: {
            traverse,
            traverseFactory,
            setState: (state: Record<string, any>) =>
              this.setState({ plugins: { ...this.state.plugins, [plugin.name]: state } }),
            getState: () => this.state,
          },
        }),
      ),
    );
  };

  clear = () => {
    this._root.clear();
  };

  setState = (state: Record<string, any>) => {
    Object.assign(this.state, state);
  };

  //
  // setFont = (font: FontObj) => {
  //   this._font = font;
  //   const { family } = font;
  //   const [variant] = font.variants;
  //
  //   var layer = new Konva.Layer();
  //   this._stage.add(layer);
  //   var text = new Konva.Text({
  //     x: 50,
  //     y: 50,
  //     fontSize: 25,
  //     text: 'A text with custom font.',
  //     width: 250,
  //   });
  //
  //   text.fontFamily(family);
  //
  //   layer.add(text);
  //   layer.draw();
  // };
  //
  // layers = async ({ confidence }: { confidence: boolean }) => {
  //   const confidenceLayer: Group = this._stage.findOne(`#${this._view.id}_xWconf`);
  //   confidenceLayer.visible(confidence);
  //   this._layers.root.batchDraw();
  //   return confidence;
  // };
  //
  // colorStops = (confidence: number): [string, string] => {
  //   return (
  //     this._colorStops
  //       // @ts-ignore
  //       .map<[string, string]>(([max, start, stop], idx) => {
  //         if (
  //           confidence <= max &&
  //           (idx == 0 || (this._colorStops[idx - 1] && this._colorStops[idx - 1][0] < confidence))
  //         ) {
  //           return [start, stop];
  //         }
  //       })
  //       .find(Boolean)
  //   );
  // };
  //
  // confidenceColor = (confidence: number) => colorBetween(...this.colorStops(confidence), confidence * 0.01, 'rgb');
  //
  // snappyBox = (bondary: any, unbound: any, factor: number, outset: number = 0) => {
  //   const { height: bHeight, y: bY } = bondary;
  //   const height = Math.ceil(Math.max(Math.ceil(bHeight * factor), MIN_THICKNESS) / SNAP_FACTOR) * SNAP_FACTOR;
  //   const y = bHeight + bY - height;
  //   const [lb, rt] = unbound;
  //   const [x0] = lb;
  //   const [x1] = rt;
  //   const width = x1 - x0;
  //   const x = x0;
  //   return {
  //     height,
  //     width,
  //     x,
  //     y: Math.ceil(y + outset * height),
  //   };
  // };
  //
  // tabSelect = (reverse = false) => {
  //   let nextStickyIndex;
  //   const wordCount = this._refs.words.length;
  //   // shift-tab -> previous word
  //   if (!this._sticky) {
  //     // assign first / last node to selection
  //     nextStickyIndex = reverse ? wordCount - 1 : 0;
  //   } else {
  //     const {
  //       attrs: { id: curId },
  //     } = this._sticky;
  //     const stickyIndex = this._refs.words.findIndex(({ attrs: { id } }) => id === curId);
  //     if (stickyIndex === wordCount - 1 && !reverse) {
  //       nextStickyIndex = 0;
  //     } else if (stickyIndex === 0 && reverse) {
  //       nextStickyIndex = wordCount - 1;
  //     } else {
  //       nextStickyIndex = (stickyIndex + (reverse ? -1 : 1)) % wordCount;
  //     }
  //   }
  //   if (this._sticky) {
  //     this._sticky.findOne('Rect').setAttrs(groups.words.bbox.common);
  //   }
  //   this._layers.root.batchDraw();
  //   this._refs.words[nextStickyIndex].findOne('Rect').fire('dblclick', {}, true);
  // };
  //
  // keyLog = () => {
  //   const container = this._stage.container();
  //
  //   container.addEventListener(
  //     'keydown',
  //     event => {
  //       const { shiftKey, defaultPrevented, key, altKey } = event;
  //       if (defaultPrevented) {
  //         return; // Do nothing if the event was already processed
  //       }
  //
  //       switch (key) {
  //         case 'Tab':
  //           // Do something for "down arrow" key press.
  //           // double-tab to leave the stage
  //           // single tab to go to next word
  //           this.tabSelect(shiftKey);
  //           break;
  //         case 'Esc': // IE/Edge specific value
  //         case 'Escape':
  //           // Do something for "esc" key press.
  //           break;
  //         default:
  //           console.log(key);
  //           return; // Quit when this doesn't handle the key event.
  //       }
  //
  //       // Cancel the default action to avoid it being handled twice
  //       event.preventDefault();
  //     },
  //     true,
  //   );
  // };
  //
  // setState = (updates: Record<string, any>) => {
  //   Object.assign(this.state, { ...updates });
  // };
  //
  // walkThrough = () => {
  //   this._layers.root.add(new Konva.Group({ id: `${this._view.id}_xWconf` }));
  //   this._layers.root.add(new Konva.Group({ id: `${this._view.id}_text` }));
  //   this._layers.root.add(new Konva.Group({ id: this._view.id }));
  //
  //   const possiblySnappyBox = (parentClientRect: any, bbox: ScopePaint['bbox'], key: string) => {
  //     if (key === 'words') {
  //       return this.snappyBox(parentClientRect, bbox, 1, 0);
  //     } else {
  //       return bboxToKonvaRect(bbox);
  //     }
  //   };
  //
  //   let timeout = setTimeout(() => {}, 0);
  //
  //   // TODO make private and rename
  //   scopeKeys.forEach(key => {
  //     const operation = (view: ScopeBranch, [key, val]: [ScopeKeys, Array<ScopeBranch & ScopePaint>]) => {
  //       const parent: Group = this._stage.findOne(`#${view.id}`);
  //       const confParent: Group = this._stage.findOne(`#${view.id}_xWconf`);
  //       const textParent: Group = this._stage.findOne(`#${view.id}_text`);
  //       const parentClientRect = parent.getClientRect({});
  //
  //       val.forEach(scope => {
  //         const group = new Konva.Group({ id: scope.id, name: scope.content });
  //         const xWconfGroup = new Konva.Group({ id: `${scope.id}_xWconf`, name: key });
  //         const textGroup = new Konva.Group({ id: `${scope.id}_text`, name: key });
  //
  //         Object.entries(scope).forEach(([prop, opts]: [string, any]) => {
  //           if (groups[key] && prop === 'bbox') {
  //             const config = groups[key].bbox;
  //             if (typeof config === 'object') {
  //               const options: ShapeConfig = {
  //                 ...possiblySnappyBox(parentClientRect, scope.bbox, key),
  //                 ...config.common,
  //               };
  //               const box = new Konva.Rect(options);
  //               box.globalCompositeOperation('multiply');
  //
  //               box.on('mouseover', evt => {
  //                 this._root = box;
  //                 timeout = setTimeout(() => {
  //                   evt.target.setAttrs({ ...config.common, ...config.temporary });
  //                   this._layers.root.batchDraw();
  //                 }, this._delay);
  //               });
  //
  //               box.on('mouseout', evt => {
  //                 clearTimeout(timeout);
  //                 if (evt.currentTarget.findAncestor('Group', true) !== this._sticky) {
  //                   this._root = blankNode;
  //                   evt.target.setAttrs({ ...config.common });
  //                   this._layers.root.batchDraw();
  //                 }
  //               });
  //
  //               // sticky
  //               box.on('dblclick', evt => {
  //                 const parent: Konva.Group = <Group>evt.currentTarget.findAncestor('Group', true);
  //                 clearTimeout(timeout);
  //                 if (parent !== this._sticky && this._sticky) {
  //                   // reset sticky, it's gonna be a new node
  //                   this._sticky.findOne('Rect').setAttrs({ ...config.common });
  //                 }
  //                 this._root = box;
  //                 evt.target.setAttrs({ ...config.common, ...config.persistent });
  //                 this._sticky = parent;
  //                 this._layers.root.batchDraw();
  //               });
  //
  //               group.add(box);
  //
  //               if (key === 'words') {
  //                 // render confidence layer
  //                 const optionsConf: ShapeConfig = {
  //                   ...this.snappyBox(parentClientRect, scope.bbox, 0.2, 0.3),
  //                   ...config.common,
  //                   // @ts-ignoreparentClientRect
  //                   fill: this.confidenceColor(scope.xWconf),
  //                   opacity: 0.5,
  //                 };
  //
  //                 // @ts-ignore
  //                 if (scope.xWconf) {
  //                   // @ts-ignore
  //                   optionsConf.name = `${scope.xWconf ? scope.xWconf : ''}`;
  //                 }
  //
  //                 const confBox = new Konva.Rect(optionsConf);
  //                 confBox.globalCompositeOperation('multiply');
  //                 xWconfGroup.add(confBox);
  //
  //                 ///////////////////////////////////////////////////////////////////
  //                 // render text layer
  //                 const textOptions: ShapeConfig = {
  //                   ...possiblySnappyBox(parentClientRect, scope.bbox, key),
  //                   ...config.common,
  //                   opacity: 1,
  //                   fill: '#fff',
  //                 };
  //
  //                 textGroup.add(new Konva.Rect(textOptions));
  //                 textGroup.add(
  //                   new Konva.Text({
  //                     ...textOptions,
  //                     text: scope.content || '',
  //                     fontSize: 26,
  //                     opacity: 1,
  //                     fill: '#000',
  //                   }),
  //                 );
  //               }
  //             }
  //           }
  //         });
  //         // order matters!
  //         textParent.add(textGroup);
  //         confParent.add(xWconfGroup);
  //         parent.add(group);
  //         this._refs[key].push(group);
  //         if (key === 'words') {
  //           this._refs._texts.push(textGroup);
  //           this._refs.xWconfs.push(xWconfGroup);
  //         }
  //       });
  //     };
  //
  //     traverseFactory(this._view, operation, key);
  //   });
  //
  //   this._layers.root.on('click', () => {
  //     this._root = blankNode;
  //     if (this._sticky) {
  //       this._sticky.setAttrs({ opacity: 0 });
  //     }
  //     this._layers.root.batchDraw();
  //   });
  //
  //   this._layers.root.draw();
  // };
  //
  // highlightById = (highlight: string) => {
  //   if (!this._ready) {
  //     throw new Error('Not yet initialized!');
  //   }
  //   const box = this._stage.findOne<Konva.Group>(`#${highlight}`);
  //   this.highlight(box.findOne('Shape'));
  // };
  //
  // highlight = (box: Konva.Rect) => {
  //   box.fire('dblclick', {}, true);
  // };

  private loadImage = (url: string) => {
    const imageObj = new Image();

    return new Promise<Dimensions>((resolve, reject) => {
      imageObj.onload = evt => {
        const { naturalHeight: height, naturalWidth: width } = imageObj;
        const imgOpts = {
          x: 0,
          y: 0,
          image: imageObj,
          width,
          height,
        };
        const img = new Konva.Image(imgOpts);

        img.globalCompositeOperation('multiply');

        this._img.add(img);
        this._root.batchDraw();
        this.setState({img: {width, height, url}})
        img.fire('load', this.state, true);

        resolve(imgOpts);
      };

      imageObj.onerror = () => reject({ width: 0, height: 0, err: 1 });
      imageObj.onabort = () => reject({ width: 0, height: 0, err: 2 });
      imageObj.src = url;
    });
  };

  get image(): Konva.Image {
    const img = this._img.findOne<Konva.Image>('Image');
    if (!img) {
      return new Konva.Image();
    }

    return img!;
  }
}

export default DocView;
