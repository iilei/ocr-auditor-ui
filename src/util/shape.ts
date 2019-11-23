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

const bboxReverse = (bbox: ShapeOptions): Array<Array<number>> => {
  const { width, height, x, y } = bbox;

  return [
    [x, y],
    [width + x, height + y],
  ];
};

export { bbox, bboxReverse };
