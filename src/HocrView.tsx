import React, { createRef, Component, SyntheticEvent, PropsWithoutRef } from 'react';
import { RouteComponentProps } from 'react-router';
import { BrowserRouter as Router, Switch, Route, Link, withRouter } from 'react-router-dom';

import { throttle } from 'lodash';
import { render } from 'react-dom';
import { Stage, StageProps } from 'react-konva';
import { DocLoader, DocView } from './modules';
import { ImgMeta } from './modules/docView';
import { KonvaEventObject } from 'konva/types/Node';
import Konva from 'konva';

// Type whatever you expect in 'this.props.match.params.*'
type PathParamsType = {
  id: string;
  page: string;
};

// component own properties
type PropsType = RouteComponentProps<PathParamsType>;

interface Cancelable {
  cancel(): void;
}

class HocrView extends Component<PropsType> {
  private stageRef = createRef<Stage>();
  private docLoader: DocLoader;

  state = {
    width: 0,
    height: 0,
    assumeSecondClick: true,
  };
  updateDimensionsThrottled: any;

  constructor(props: PropsType) {
    super(props);

    const { id, page = '1' } = props.match.params;
    // const { realm } = xyz; // TODO obtain realm from credentials

    this.docLoader = new DocLoader(`/${id}.json`, page);
    this.stageRef = { current: null };
  }

  componentDidMount() {
    this.updateDimensionsThrottled = throttle(this.updateDimensions, 333, { trailing: true, leading: false });
    window.addEventListener('resize', this.updateDimensionsThrottled);

    const node = this.stageRef.current;

    if (node) {
      const doc = this.docLoader.get().then(
        view => {
          const docView = new DocView(node.getStage(), this.docLoader);
          docView.init(({ width, height }: ImgMeta) => {
            this.setState({ width, height }, () => (docView.ready = true));
          });
        },
        error => {},
      );
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensionsThrottled);
    this.updateDimensionsThrottled.cancel();
  }

  updateDimensions = (event?: SyntheticEvent): Cancelable | void => {
    const { current: stageRef } = this.stageRef;
    if (stageRef && event) {
    }
  };

  clickHandler = (event: KonvaEventObject<MouseEvent>) => {
    // TODO bind to keyboard shortcuts; tab through, pageDown to select next paragraph?
    const possiblyDoubleClick = setTimeout(() => {
      if (event.evt.detail === 1 && this.state.assumeSecondClick) {
        this.handleSingleClick(event);
      }
      this.setState({ assumeSecondClick: true });
    }, 330);
    // it was a double click
    if (event.evt.detail === 2) {
      window.clearTimeout(possiblyDoubleClick);
      this.setState({ assumeSecondClick: false });
      this.handleDoubleClick(event);
    }
  };

  handleSingleClick = (event: KonvaEventObject<MouseEvent>) => {
    const scopeId = event.target.getParent().getId();
    console.log(`${scopeId} clicked`);
    console.log(event.target.getParent().attrs.name);
  };

  handleDoubleClick = (event: KonvaEventObject<MouseEvent>) => {
    const scopeId = event.target.getParent().getId();
    console.log(`${scopeId} double clicked`);
    console.log(event.target.getParent().attrs.name);
  };

  render() {
    const { width, height } = this.state;
    return <Stage ref={this.stageRef} width={width} height={height} onClick={this.clickHandler} />;
  }
}

export default withRouter(HocrView);
