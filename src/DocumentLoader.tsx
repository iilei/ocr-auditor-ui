import React, { Component } from 'react';
import DocLoader from './modules/docLoader';
import { flatten, isEqual } from 'lodash';
import allPlugins from './plugins/all';
import { DocView } from './modules';
import defaultPluginOptions from './plugins/options';
import Konva from 'konva';

export type Props = {
  url: string;
  page: number | string;
  onDocumentLoaded?: (view: DocView) => {};
};

class DocumentLoader extends Component<Props> {
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
    const { url, page = 1 } = this.props;

    this.docLoader.get().then(this.onDocumentLoaded);
  };

  render() {
    return <></>;
  }
}

export default DocumentLoader;
