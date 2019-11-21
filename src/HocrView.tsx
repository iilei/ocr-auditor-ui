import React, { createRef, Component } from 'react';
import { KonvaNodeEvents, Stage, StageProps } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';

import { DocLoader, DocView } from './modules';
import { Plugin, Dimensions } from './modules/types/docView';
import allPlugins from './plugins/all';

import Konva from 'konva';
import { flatten } from 'lodash';

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
  id: string;
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
  readonly docLoader: DocLoader;
  docView: DocView | undefined;
  onDblClick: Function;
  onClick: Function;
  onKeyPress: Function;
  onLoad: Function;
  onInitialized: Function;
  onTokenFocus: Function;
  plugins: Array<Plugin>;

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
      id,
      page = 1,
      plugins = flatten(allPlugins),
      onClick = noop,
      onKeyPress = noop,
      onDblClick = noop,
      onLoad = noop,
      onTokenFocus = noop,
      onInitialized = noop,
    } = props;

    this.onDblClick = onDblClick;
    this.onClick = onClick;
    this.onKeyPress = onKeyPress;
    this.onLoad = onLoad;
    this.onTokenFocus = onTokenFocus;
    this.onInitialized = onInitialized;
    this.docLoader = new DocLoader(`/${id}.json`, String(page));
    this.stageRef = { current: null };
    this.plugins = plugins;
  }

  componentDidMount() {
    const node = this.stageRef.current;

    if (node) {
      this.docLoader.get().then(
        async view => {
          this.docView = new DocView({ stageNode: node.getStage(), doc: this.docLoader, plugins: this.plugins });
          await this.docView.init();
          // TODO: refactor and use onLoad Event handler instead
          const image: Konva.Image = this.docView.image!;
          this.resize({ height: image.getHeight(), width: image.getWidth() });
        },
        error => {},
      );
    }
  }

  resize = ({ width, height }: Dimensions) => {
    this.setState({ width, height });
  };

  handleDoubleClick = (event: KonvaEventObject<MouseEvent>) => {
    this.onTokenFocus(event);
  };

  handleLoad = (event: KonvaEventObject<Event>) => {
    this.onLoad(event);
  };

  handleInitialized = (event: KonvaEventObject<Event>) => {
    this.onInitialized(event);
  };

  render() {
    const { width, height } = this.state;

    return (
      <Stage
        tabIndex={1}
        ref={this.stageRef}
        width={width}
        height={height}
        onDblClick={this.handleDoubleClick}
        onLoad={this.handleLoad}
        onInitialized={this.handleInitialized}
      />
    );
  }
}

export default HocrView;
