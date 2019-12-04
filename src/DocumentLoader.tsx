import React, { Children, Component } from 'react';
import DocLoader from './modules/docLoader';
import { DocView } from './modules';

export type Props = {
  url: string;
  page: number | string;
  onDocumentLoaded?: (view: DocView) => {};
};

export type Document = {
  id: number | string;
  ppageno: number | string;
  [other: string]: any;
};

class DocumentLoader extends Component<Props> {
  static displayName = 'DocumentLoader';
  docView: DocView | undefined;
  docLoader: DocLoader;

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
    this.initializeDocument();
  }

  initializeDocument = () => {
    this.docLoader.get().then(this.onDocumentLoaded);
  };

  onDocumentLoaded = async (doc: DocView['_view']) => {
    this.setState({ view: doc });
  };

  render() {
    const { children } = this.props;
    if (!this.state.view) {
      return <></>;
    }
    return (
      <>
        {Children.map(children, child => {
          // @ts-ignore
          return React.cloneElement(child, {
            view: this.state.view,
            // @ts-ignore
            ...child.props,
          });
        })}
      </>
    );
  }
}

export default DocumentLoader;
