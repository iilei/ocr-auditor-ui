import React from 'react';
import { actions } from '@storybook/addon-actions';
import { object, withKnobs } from '@storybook/addon-knobs';
import HocrView from '../HocrView';
import componentNotes from '../ocrView.md';
import pluginOptions from '../plugins/options';

export default {
  component: HocrView,
  title: 'Hocr View',
  parameters: { notes: componentNotes },
  decorators: [withKnobs],
};

const eventsFromObject = actions('onLoad', 'onTokenfocus', 'onInitialized', 'onMouseDown', 'onMouseUp');

export const phototestPage1 = () => (
  <HocrView {...eventsFromObject} id="phototest" page={1} pluginOptions={object('Plugin Options', pluginOptions)} />
);
