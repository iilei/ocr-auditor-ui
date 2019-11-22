const bbox = (bbox: Array<Array<number>>) => {
  const [lb, rt] = bbox;
  const [x0, y0] = lb;
  const [x1, y1] = rt;

  return {
    height: y1 - y0,
    width: x1 - x0,
    x: x0,
    y: y0,
  };
};

const snapTo = () => {};

export { bbox, snapTo };
