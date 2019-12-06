import React, { Children, Component, createRef } from 'react';
import DocLoader from './modules/docLoader';
import { DocView } from './modules';

export type Props = {
  url: string;
  page: number | string;
  onLoad?: (view: DocView['_view']) => unknown;
};

export type Document = {
  id: number | string;
  ppageno: number | string;
  [other: string]: any;
};

const noop = () => null;

class DocumentLoader extends Component<Props> {
  static displayName = 'DocumentLoader';
  docView: DocView | undefined;
  docLoader: DocLoader;
  wrapperRef = createRef<HTMLDivElement>();

  state: { view?: Document } & Record<string, any> = {};

  constructor(props: Props) {
    super(props);

    const { url, page = 1 } = props;

    this.docLoader = new DocLoader(url, String(page));
  }

  componentDidMount() {
    this.initializeDocument();
  }

  componentDidUpdate(prevProps: Props) {
    this.docLoader.page = String(this.props.page);
    this.docLoader.doc = String(this.props.url);
    // TODO - compare prevProps
    // this.initializeDocument();
  }

  initializeDocument = () => {
    this.docLoader.get().then(this.onDocumentLoaded);
  };

  onDocumentLoaded = async (view: DocView['_view']) => {
    this.setState({ view });
    this.props.onLoad && this.props.onLoad(view);
  };

  render() {
    const { children } = this.props;
    if (!this.state.view) {
      return <></>;
    }
    return (
      <div ref={this.wrapperRef}>
        {Children.map(children, child => {
          // @ts-ignore
          return React.cloneElement(child, {
            view: this.state.view,
            // @ts-ignore
            ...child.props,
          });
        })}
      </div>
    );
  }
}

export default DocumentLoader;
