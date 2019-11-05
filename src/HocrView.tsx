import React, { createRef, Component, Fragment } from 'react';
import { Switch, FormCheck, FormCheckLabel } from '@smooth-ui/core-sc';
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
  docView: DocView | undefined;

  state = {
    width: 0,
    height: 0,
    showConfidence: true,
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
          this.docView = new DocView(node.getStage(), this.docLoader);
          const { width, height } = await this.docView.init();
          //          const hash = document.location.hash.replace(/^#?/, '')
          // docView.highlightById('par_1_2');
          this.setState({ width, height });
        },
        error => {},
      );
    }
  }

  handleDoubleClick = (event: KonvaEventObject<MouseEvent>) => {
    const scopeId = event.target.getParent().getId();
    console.log(`${scopeId} double clicked`);
    console.log(event.target.getParent().attrs.name);
  };

  toggleConfidenceVisibility = async (event: React.FormEvent<HTMLInputElement>) => {
    // @ts-ignore
    const showConfidence = !Boolean(parseInt(event.target.value || 0, 10));
    if (this.docView) {
      await this.docView.layers({ confidence: showConfidence });
    }
    this.setState({ showConfidence });
  };

  toggleSticky = () => {
    return 0;
  };

  render() {
    const { width, height, showConfidence } = this.state;
    const sticky = true;
    console.log(showConfidence);
    return (
      <Fragment>
        <Stage tabIndex={1} ref={this.stageRef} width={width} height={height} onDblClick={this.handleDoubleClick} />
        <FormCheck>
          <Switch
            name="confidence"
            scale="sm"
            tabIndex={1}
            checked={showConfidence}
            onChange={this.toggleConfidenceVisibility}
            value={Number(showConfidence)}
          />
          {/* TODO hover Style */}
          <FormCheckLabel name="confidence">Confidence</FormCheckLabel>
        </FormCheck>
        <FormCheck>
          <Switch
            name="sticky"
            scale="sm"
            tabIndex={1}
            checked={sticky}
            onChange={this.toggleSticky}
            value={Number(sticky)}
            disabled
          />
          {/* TODO hover Style */}
          <FormCheckLabel name="sticky">Sticky</FormCheckLabel>
        </FormCheck>
      </Fragment>
    );
  }
}

export default withRouter(HocrView);
