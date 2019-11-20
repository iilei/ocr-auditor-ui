import React, { createRef, Component } from 'react';
import { KonvaNodeEvents, Stage, StageProps } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';

import { DocLoader, DocView } from './modules';
import Konva from 'konva';

export interface KeyboardEvents {
  onKeyPress?(evt: Konva.KonvaEventObject<Event>): void;
}

export interface LoadEvents {
  onLoad?(evt: Konva.KonvaEventObject<Event>): void;
}

export interface Props extends KonvaNodeEvents, StageProps, KeyboardEvents, LoadEvents {
  id: string;
  page?: number | string;
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

  state = {
    width: 0,
    height: 0,
    activeFontFamily: '',
    showConfidence: true,
  };
  updateDimensionsThrottled: any;

  constructor(props: Props) {
    super(props);

    const noop = (): any => null;

    const { id, page = 1, onClick = noop, onKeyPress = noop, onDblClick = noop, onLoad = noop } = props;

    this.onDblClick = onDblClick;
    this.onClick = onClick;
    this.onKeyPress = onKeyPress;
    this.onLoad = onLoad;
    this.docLoader = new DocLoader(`/${id}.json`, String(page));
    this.stageRef = { current: null };
  }

  componentDidMount() {
    const node = this.stageRef.current;

    if (node) {
      this.docLoader.get().then(
        async view => {
          this.docView = new DocView(node.getStage(), this.docLoader);
          const { width, height } = await this.docView.init();

          // const hash = document.location.hash.replace(/^#?/, '')
          // docView.highlightById('par_1_2');
          this.setState({ width, height });
        },
        error => {},
      );
    }
  }

  handleDoubleClick = (event: KonvaEventObject<MouseEvent>) => {
    const id = event.target.getParent().getId();
    const name = event.target.getParent().attrs.name;
    this.onDblClick({ id, name });
  };

  handleLoad = (event: KonvaEventObject<Event>) => {
    this.onLoad(event);
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
      />
    );
  }
}

export default HocrView;
