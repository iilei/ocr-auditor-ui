import React, { createRef, Component, SyntheticEvent } from 'react';
import styled from 'styled-components';
import { throttle } from 'lodash';
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer, Star, Text } from 'react-konva';

interface Cancelable {
  cancel(): void;
}

const Img = styled.img`
  object-fit: contain;
  background-color: #03a9f4;
`;

class HocrView extends Component {
  private imgRef = createRef<HTMLImageElement>();

  state = {
    width: 0,
    height: 0,
    naturalHeight: 0,
    naturalWidth: 0,
  };

  updateDimensionsThrottled: any;

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
    const { width, height, naturalHeight, naturalWidth } = this.state;

    return (
      <React.Fragment>
        <Img src="./phototest.gif" ref={this.imgRef} onLoad={this.updateDimensions} />
        <Stage width={width} height={height} style={{ marginTop: this.state.height * -1 }} />
      </React.Fragment>
    );
  }
}

export default HocrView;
