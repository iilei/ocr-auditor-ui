import React, { createRef, Component, SyntheticEvent, PropsWithoutRef } from 'react';
import { RouteComponentProps } from 'react-router';
import { BrowserRouter as Router, Switch, Route, Link, withRouter } from 'react-router-dom';

import styled from 'styled-components';
import { throttle } from 'lodash';
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer, Star, Text } from 'react-konva';

import docLoader from './modules/docLoader';

// Type whatever you expect in 'this.props.match.params.*'
type PathParamsType = {
  id: string;
};

// component own properties
type PropsType = RouteComponentProps<PathParamsType>;

interface Cancelable {
  cancel(): void;
}

const Img = styled.img`
  object-fit: contain;
  background-color: #03a9f4;
`;

class HocrView extends Component<PropsType> {
  private imgRef = createRef<HTMLImageElement>();
  state = {
    width: 0,
    height: 0,
    naturalHeight: 0,
    naturalWidth: 0,
  };
  updateDimensionsThrottled: any;

  constructor(props: PropsType) {
    super(props);

    const { id } = props.match.params;
    // const { realm } = xyz; // TODO obtain realm from credentials

    const doc = docLoader(`/${id}.json`).then(
      result => {
        console.log(result);
        debugger;
      },
      error => {},
    );
  }

  componentDidMount() {
    this.updateDimensionsThrottled = throttle(this.updateDimensions, 333, { trailing: true, leading: false });

    window.addEventListener('resize', this.updateDimensionsThrottled);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensionsThrottled);
    this.updateDimensionsThrottled.cancel();
  }

  // throttle?
  updateDimensions = (event?: SyntheticEvent): Cancelable | void => {
    const { current: imgRef } = this.imgRef;
    if (imgRef && imgRef.complete && event) {
      const { height, width, bottom, left, right, top } = imgRef.getBoundingClientRect();
      const { naturalHeight, naturalWidth } = imgRef;

      const payload = { height, width, bottom, left, right, top, naturalHeight, naturalWidth };

      this.setState(payload);
    }
  };

  render() {
    return (
      <React.Fragment>
        <Stage />
      </React.Fragment>
    );
  }
}

export default withRouter(HocrView);
