const strokeInset = (shape: ShapeOptions & typeof Konva.Shape) => {
  const { x, y, width, height, strokeWidth } = shape;
  const strokeWidthEnsured = typeof strokeWidth === 'number' ? strokeWidth : 1;

  const strokeNew = { ...shape, strokeWidth: strokeWidthEnsured };
  return {
    ...strokeNew,
    x: x + strokeWidthEnsured / 2,
    y: y + strokeWidthEnsured / 2,
    width: width - strokeWidthEnsured,
    height: height - strokeWidthEnsured,
  };
};
export default strokeInset;
