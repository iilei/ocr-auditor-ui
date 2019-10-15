import React, { createRef, Component } from 'react';
import styled from 'styled-components';
import { throttle } from 'lodash';

interface Cancelable {
  cancel(): void;
}

const Stage = styled.section`
  flex: 1 0 auto;
  background: #fff;
  display: flex;
`;

const Actor = styled.section`
  flex: 1 0 auto;
  background: #e91e63;
  outline: 1px solid rgba(255, 255, 255, 0.5);
`;

const ImgLayer = styled.section`
  flex: 1 0 auto;
  background-color: #ffeb3b;
  outline: 1px solid rgba(255, 255, 255, 0.5);
  opacity: 0.8;
  position: relative;
`;

const Img = styled.img`
  object-fit: contain;
  width: 50vw;
  display: flex;
`;

const Line = styled.div`
  object-fit: contain;
  width: 50vw;
  display: flex;
  background: rgba(0, 188, 212, 0.5);
  min-height: 1px;
  position: absolute;
  top: 0;
  font-size: 0;
  line-height: 10vh;
`;

class SplitView extends Component {
  private imgRef = createRef<HTMLImageElement>();

  state = {
    width: 0,
    height: 0,
  };

  updateDimensionsThrottled: any;

  //
  // constructor (props: React.ComponentProps<any>) {
  //   super(props);
  //
  // }
  componentDidMount() {
    this.updateDimensions();

    // React.Dispatch<any>

    this.updateDimensionsThrottled = throttle(this.updateDimensions, 333, { trailing: true, leading: false });

    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
    this.updateDimensionsThrottled.cancel();
  }

  // throttle?
  updateDimensions = (): Cancelable | void => {
    // TODO use // $0.getBoundingClientRect() on resize
    if (this.imgRef.current) {
      const { height, width, bottom, left, right, top } = this.imgRef.current.getBoundingClientRect();
      this.setState({ height, width, bottom, left, right, top });
      console.log(this.state, this.imgRef);
    }
  };

  render() {
    return (
      <Stage>
        <ImgLayer>
          <Img src="./phototest.gif" ref={this.imgRef} />
          <Line>&nbsp;</Line>
        </ImgLayer>
        <Actor>
          <Img src="./phototest.gif" />a
        </Actor>
      </Stage>
    );
  }
}

export default SplitView;
