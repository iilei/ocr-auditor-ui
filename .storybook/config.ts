import { configure } from '@storybook/react';
import { configureActions } from '@storybook/addon-actions';

configureActions({
  depth: 100,
  // Limit the number of items logged into the actions panel
  limit: 20,
})

// automatically import all files ending in *.stories.(tsx|jsx)
configure(require.context('../src/stories', true, /\.stories\.[tj]sx?$/), module);
