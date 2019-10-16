import React, { createRef, Component } from 'react';
import styled from 'styled-components';
import { throttle } from 'lodash';

interface Cancelable {
  cancel(): void;
}

const Img = styled.img`
  object-fit: contain;
`;

class HocrView extends Component {
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
      <React.Fragment>
        <Img src="./phototest.gif" ref={this.imgRef} />
      </React.Fragment>
    );
  }
}

export default HocrView;
