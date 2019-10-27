import React, { createRef, Component } from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';
import { Stage } from 'react-konva';
import { DocLoader, DocView } from './modules';
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

class HocrView extends Component<PropsType> {
  readonly stageRef = createRef<Stage>();
  readonly docLoader: DocLoader;

  state = {
    width: 300,
    height: 300,
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
    const node = this.stageRef.current;

    if (node) {
      this.docLoader.get().then(
        async view => {
          const docView = new DocView(node.getStage(), this.docLoader);
          const { width, height } = await docView.init();
          //          const hash = document.location.hash.replace(/^#?/, '')
          docView.highlightById('line_1_7');
          this.setState({ width, height });
        },
        error => {},
      );
    }
  }

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
    return (
      <Stage
        ref={this.stageRef}
        width={width}
        height={height}
        onClick={this.handleDoubleClick}
        onDblClick={this.handleDoubleClick}
      />
    );
  }
}

export default withRouter(HocrView);
