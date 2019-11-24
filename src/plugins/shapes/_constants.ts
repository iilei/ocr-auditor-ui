export const name = 'shapes';
export const context = 'canvas';
export const tokens = ['careas', 'pars', 'lines', 'words'];

const confidence = {
  opacity: 0.2,
  globalCompositeOperation: 'multiply',
  visible: true,
};

export const renderOptions = {
  snapOptions: {
    snappy: true,
    padding: { left: 12, lineEnd: 12 },
  },
  outer: { fill: 'turquoise', opacity: 0.1, globalCompositeOperation: 'multiply' },
  inner: { stroke: 'turquoise', opacity: 0.8, globalCompositeOperation: 'multiply', strokeWidth: 1 },
  confidence,
  confidenceByRange: [
    {
      range: [0, 0.3],
      fill: 'ruby',
    },
    {
      range: [0.3, 0.6],
      fill: 'orange',
    },
    {
      range: [0.6, 0.9],
      fill: 'yellow',
    },
    {
      range: [0.9, 1],
      fill: 'green',
    },
  ],
};
