export const name = 'shapes';
export const context = 'canvas';
export const tokens = ['careas', 'pars', 'lines', 'words'];

const confidence = {
  konvaOptions: {
    opacity: 0.8,
    globalCompositeOperation: 'multiply',
    visible: true,
    height: 4,
  },
  rangeOptions: [
    {
      range: [0, 40],
      konvaOptions: {
        fill: 'red',
      },
    },
    {
      range: [40, 50],
      konvaOptions: {
        fill: 'orangered',
      },
    },
    {
      range: [50, 60],
      konvaOptions: {
        fill: 'orange',
      },
    },
    {
      range: [60, 75],
      konvaOptions: {
        fill: 'gold',
      },
    },
    {
      range: [75, 90],
      konvaOptions: {
        fill: 'greenyellow',
      },
    },
    {
      range: [90, 100],
      konvaOptions: {
        fill: 'limegreen',
      },
    },
  ],
};

export const renderOptions = {
  snapOptions: {
    snappy: true,
    padding: { left: 12, lineEnd: 12 },
  },
  outer: { fill: 'turquoise', opacity: 0.06, globalCompositeOperation: 'multiply' },
  inner: { stroke: 'turquoise', opacity: 0.8, globalCompositeOperation: 'multiply', strokeWidth: 1 },
  confidence,
};
