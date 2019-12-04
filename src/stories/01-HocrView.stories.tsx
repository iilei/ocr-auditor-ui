import React from 'react';
import { actions } from '@storybook/addon-actions';
import { array, object, withKnobs } from '@storybook/addon-knobs';
import HocrView from '../HocrView';
import Snapshot from '../Snapshot';
import DocumentLoader from '../DocumentLoader';
import componentNotes from '../ocrView.md';
import pluginOptions from '../plugins/options';

export default {
  title: 'Hocr View',
  parameters: { notes: componentNotes },
  decorators: [withKnobs],
};

const stripeImg =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAKElEQVQImWNk+K/FwMDw//U1BgYGJjiLUVSL8f8rBggLKgNh/X99DQBTKAwZprW6SAAAAABJRU5ErkJggg==';

const eventsFromObject = actions('onLoad', 'onTokenfocus', 'onInitialized', 'onMouseDown', 'onMouseUp');

export const optionsObject = () => {
  return (
    <div style={{ display: 'inline-block', padding: 4, backgroundImage: `url("${stripeImg}")` }}>
      <DocumentLoader url="./phototest.json" page={1}>
        <HocrView {...eventsFromObject} pluginOptions={object('Plugin Options', pluginOptions)} />
      </DocumentLoader>
    </div>
  );
};

const debug = React.createRef<HTMLPreElement>();
const debugImg = React.createRef<HTMLImageElement>();

export const snapshotComponent = () => {
  const onReady = (snapshot: string) => {
    const { current: pre } = debug;
    const { current: image } = debugImg;

    if (pre) {
      pre.innerText = JSON.stringify(snapshot);
    }

    if (image) {
      image.src = snapshot;
    }

    return true;
  };

  const value = array('Snapshot of Range', 'word_1_52,word_1_60'.split(','));

  return (
    <>
      <div style={{ display: 'none' }}>
        <DocumentLoader url="./phototest.json" page={1}>
          <HocrView {...eventsFromObject}>
            <Snapshot range={value} onReady={onReady} />
          </HocrView>
        </DocumentLoader>
      </div>
      <h3 style={{ font: 'menu', fontSize: 24, fontWeight: 'bold' }}>onReady yields:</h3>
      <img alt="" ref={debugImg} style={{ padding: 4, backgroundImage: `url("${stripeImg}")` }} />
      <pre ref={debug} />
    </>
  );
};
