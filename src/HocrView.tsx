import React, { Children, Component, createRef } from 'react';
import { KonvaNodeEvents, Stage, StageProps } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';

import { DocView } from './modules';
import { Document } from './DocumentLoader';
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
  view?: Document;
  plugins?: Array<Plugin>;
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
    docViewReady: false,
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

  async componentDidMount() {
    await this.initialize();
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

  initialize = async () => {
    const { view } = this.props;
    const node = this.stageRef.current;
    if (!view) {
      return null;
    }

    const { ppageno: page, id } = view;
    // @ts-ignore
    const { page: _page, id: _id } = this.state;
    if (_id === id && _page === page) {
      return;
    }
    this.setState({ page, id });

    if (node) {
      this.docView = new DocView({
        stageNode: node.getStage(),
        doc: { view },
        plugins: this.plugins,
        pluginOptions: this.props.pluginOptions || defaultPluginOptions,
      });

      // @ts-ignore
      await this.docView.init();
      this.setState({ docViewReady: true });

      // TODO: refactor and use onLoad Event handler instead
      // @ts-ignore
      if (this.docView.image) {
        const image: Konva.Image = this.docView.image;
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
    const { width, height, docViewReady } = this.state;
    const { children } = this.props;

    if (!this.props.view) {
      return <></>;
    }

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
          // @ts-ignore
          return React.cloneElement(child, {
            docView: docViewReady ? this.docView : null,
            view: this.props.view,
            // @ts-ignore
            ...child.props,
          });
        })}
      </>
    );
  }
}

export default HocrView;
