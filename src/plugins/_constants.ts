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
  outer: { visible: false },
  // inner: { stroke: 'turquoise', opacity: 0.8, globalCompositeOperation: 'multiply', strokeWidth: 1 },
  inner: { visible: false },
  confidence,
};

export const selectionOptions = {
  inRange: { opacity: 0.4, fill: '#81d4fa', globalCompositeOperation: 'multiply', visible: true },
  outOfRange: { opacity: 0.06 },
  range: ['word_1_1', 'word_1_3'],
};
