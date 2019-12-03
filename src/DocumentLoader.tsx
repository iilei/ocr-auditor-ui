import React, { Component } from 'react';
import DocLoader from './modules/docLoader';
import { DocView } from './modules';

export type Props = {
  url: string;
  page: number | string;
  onDocumentLoaded?: (view: DocView) => {};
};

class DocumentLoader extends Component<Props> {
  static displayName = 'DocumentLoader';

  onDocumentLoaded: (view: DocView) => {};
  docView: DocView | undefined;
  docLoader: DocLoader;

  constructor(props: Props) {
    super(props);

    const noop = (): any => null;

    const { url, page = 1, onDocumentLoaded = noop } = props;

    this.onDocumentLoaded = onDocumentLoaded;
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

  render() {
    return <></>;
  }
}

export default DocumentLoader;
