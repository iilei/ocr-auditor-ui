import React from 'react';
import { actions } from '@storybook/addon-actions';
// import { withKnobs, text } from "@storybook/addon-knobs";
import HocrView from '../HocrView';
import componentNotes from '../ocrView.md';

export default {
  component: HocrView,
  title: 'Hocr View',
  parameters: { notes: componentNotes },
  // decorators: [withKnobs],
};

const eventsFromObject = actions('onLoad', 'onTokenFocus', 'onInitialized');

export const phototestPage1 = () => <HocrView {...eventsFromObject} id="phototest" page={1} />;
