import React from 'react';
import { actions } from '@storybook/addon-actions';
import HocrView from '../HocrView';
import componentNotes from '../ocrView.md';

export default {
  component: HocrView,
  title: 'Hocr View',
  parameters: { notes: componentNotes },
};

const eventsFromObject = actions({ onTokenFocus: 'TokenFocus', onLoad: 'Load' });

export const phototestPage1 = () => (
  <HocrView {...eventsFromObject} id="phototest" page="1">
    Hello Button
  </HocrView>
);
