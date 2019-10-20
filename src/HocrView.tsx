import React, { createRef, Component, SyntheticEvent, PropsWithoutRef } from 'react';
import { RouteComponentProps } from 'react-router';
import { BrowserRouter as Router, Switch, Route, Link, withRouter } from 'react-router-dom';

import styled from 'styled-components';
import { throttle } from 'lodash';
import { render } from 'react-dom';
import { KonvaNodeEvents, Stage, StageProps } from 'react-konva';

import { DocLoader, DocView } from './modules';
import { ImgMeta } from './modules/docView';

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

const StyledStage = styled(Stage)`
  & canvas {
    height: 100% !important;
    width: 100% !important;
    object-fit: contain;
  }
`;

class HocrView extends Component<PropsType> {
  private stageRef = createRef<Stage>();
  private docLoader: DocLoader;

  state = {
    width: 0,
    height: 0,
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
          docView.loadImage(({ width, height }: ImgMeta) => {
            this.setState({ width, height });
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

  render() {
    const { width, height } = this.state;
    return <StyledStage ref={this.stageRef} width={width} height={height} />;
  }
}

export default withRouter(HocrView);
