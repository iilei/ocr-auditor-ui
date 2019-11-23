export const name = 'shapes';
export const context = 'canvas';
export const tokens = ['careas', 'pars', 'lines', 'words'];

export const defaultOptions = { snappy: true, padding: { left: 12, lineEnd: 12 } };
export const renderOptions = {
  outer: { fill: 'turquoise', opacity: 0.1, globalCompositeOperation: 'multiply' },
  inner: { stroke: 'doggerblue', opacity: 0.4, globalCompositeOperation: 'multiply', strokeWidth: 1 },
};
