import React, { Children, Component, createRef } from 'react';
import { KonvaNodeEvents, Stage, StageProps } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';

import { DocView } from './modules';
import { Dimensions, Plugin } from './modules/types/docView';
import allPlugins from './plugins/all';

import defaultPluginOptions from './plugins/options';
import Konva from 'konva';
import { flatten, isEqual } from 'lodash';

export interface KeyboardEvents {
  onKeyPress?(evt: Konva.KonvaEventObject<Event>): void;
}

export interface LoadEvent {
  onLoad?(evt: Konva.KonvaEventObject<Event>): void;
}

export interface TokenFocusEvent {
  onTokenFocus?(evt: Konva.KonvaEventObject<Event>): void;
}

export interface Props extends KonvaNodeEvents, StageProps, KeyboardEvents, LoadEvent, TokenFocusEvent {
  id?: string;
  page?: number | string;
  plugins?: Array<Plugin>;
}

export interface OCRPayload {
  id: string;
  name: string;
}

interface Cancelable {
  cancel(): void;
}

class HocrView extends Component<Props> {
  readonly stageRef = createRef<Stage>();
  onDblClick: Function;
  onClick: Function;
  onKeyPress: Function;
  onMouseUp: Function;
  onMouseDown: Function;
  onLoad: Function;
  onInitialized: Function;
  onTokenfocus: Function;
  plugins: Array<Plugin>;
  docView?: DocView;

  state = {
    width: 0,
    height: 0,
    activeFontFamily: '',
    showConfidence: true,
  };

  constructor(props: Props) {
    super(props);

    const noop = (): any => null;

    const {
      plugins = flatten(allPlugins),
      onClick = noop,
      onKeyPress = noop,
      onDblClick = noop,
      onLoad = noop,
      onTokenfocus = noop,
      onInitialized = noop,
      onMouseUp = noop,
      onMouseDown = noop,
    } = props;

    this.onDblClick = onDblClick;
    this.onClick = onClick;
    this.onKeyPress = onKeyPress;
    this.onLoad = onLoad;
    this.onMouseUp = onMouseUp;
    this.onMouseDown = onMouseDown;
    this.onInitialized = onInitialized;
    this.onTokenfocus = onTokenfocus;
    this.stageRef = { current: null };
    this.plugins = plugins;
  }

  resize = ({ width, height }: Dimensions) => {
    this.setState({ width, height });
  };

  handleTokenFocus = (event: KonvaEventObject<MouseEvent>) => {
    this.onTokenfocus(event);
  };

  handleLoad = (event: KonvaEventObject<Event>) => {
    this.onLoad(event);
  };

  handleInitialized = (event: KonvaEventObject<Event>) => {
    this.onInitialized(event);
  };

  onDocumentLoaded = async (doc: DocView['_view']) => {
    const node = this.stageRef.current;
    const { ppageno: page, id } = doc;
    // @ts-ignore
    const { page: _page, id: _id } = this.state;
    if (_id === id && _page === page) {
      return;
    }
    this.setState({ page, id });

    if (node) {
      this.docView = new DocView({
        stageNode: node.getStage(),
        doc: { view: doc },
        plugins: this.plugins,
        pluginOptions: this.props.pluginOptions || defaultPluginOptions,
      });

      // @ts-ignore
      await this.docView.init();

      // TODO: refactor and use onLoad Event handler instead
      // @ts-ignore
      if (this.docView.image) {
        // @ts-ignore
        const image: Konva.Image = this.docView.image!;
        this.resize({ height: image.getHeight(), width: image.getWidth() });

        this.componentDidUpdate = (prevProps: Record<string, any>) => {
          if (!isEqual(this.props.pluginOptions, prevProps.pluginOptions)) {
            // @ts-ignore
            this.docView.setState({ plugins: this.props.pluginOptions });
          }
        };
      }
    }
  };

  render() {
    const { width, height } = this.state;
    const { children } = this.props;

    return (
      <>
        <Stage
          tabIndex={1}
          ref={this.stageRef}
          width={width}
          height={height}
          onDblClick={this.handleTokenFocus} // TODO refactor and `fire('focus.token')`
          onMouseDown={this.props.onMouseDown}
          onMouseUp={this.props.onMouseUp}
          onLoad={this.handleLoad}
          onInitialized={this.handleInitialized}
          pluginOptions={this.props.pluginOptions || defaultPluginOptions}
        />
        {Children.map(children, child => {
          debugger;
          // @ts-ignore
          const coercedChild = <>{child}</>;
          // @ts-ignore
          if (child.type.displayName === 'DocumentLoader') {
            // @ts-ignore
            return React.cloneElement(child, {
              // @ts-ignore
              url: child.props.url,
              // @ts-ignore
              page: child.props.page,
              onDocumentLoaded: this.onDocumentLoaded,
            });
          } else if (this.docView && this.docView._plugins) {
            // @ts-ignore
            return React.cloneElement(child, {
              docView: this.docView,
              ...coercedChild.props,
            });
          }
        })}
      </>
    );
  }
}

export default HocrView;
