const bbox = (bbox: Array<Array<number>>) => {
  // * the order of the values are `x0 y0 x1 y1` = "left top right bottom"
  // https://github.com/kba/hocr-spec/issues/34
  const [lt, rb] = bbox;
  const [x0, y0] = lt;
  const [x1, y1] = rb;

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
