import React, { createRef, Component, SyntheticEvent, PropsWithoutRef } from 'react';
import { RouteComponentProps } from 'react-router';
import { BrowserRouter as Router, Switch, Route, Link, withRouter } from 'react-router-dom';

import { throttle } from 'lodash';
import { render } from 'react-dom';
import { KonvaNodeEvents, Stage, StageProps } from 'react-konva';

import { DocLoader, DocView } from './modules';
import { ImgMeta } from './modules/docView';
import { KonvaEventObject } from 'konva/types/Node';

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

// const StyledStage = styled(Stage)`
//   flex: 1;
//   width: auto;
//   height: 100vh;
//   & .konvajs-content {
//     flex: 1;
//     width: auto !important;
//     height: 100vh !important;
//   }
//   & canvas {
//     display: flex;
//     flex: 1;
//     object-fit: contain;
//     width: auto !important;
//     height: 100vh !important;
//   }
// `;

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

    if (this.stageRef.current) {
      const doc = this.docLoader.get().then(
        view => {
          const docView = new DocView(this.stageRef, this.docLoader);
          docView.init(({ width, height }: ImgMeta) => {
            this.setState({ width, height }, docView.walkThrough);
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
  };

  handleDoubleClick = (event: KonvaEventObject<MouseEvent>) => {
    const scopeId = event.target.getParent().getId();
    console.log(`${scopeId} double clicked`);
  };

  render() {
    const { width, height } = this.state;
    return <Stage ref={this.stageRef} width={width} height={height} onClick={this.clickHandler} />;
  }
}

export default withRouter(HocrView);
