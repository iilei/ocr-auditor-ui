const strokeInset = (shape: ShapeOptions & typeof Konva.Shape) => {
  const { x, y, width, height, strokeWidth } = shape;
  const strokeWidthEnsured = typeof strokeWidth === 'number' ? strokeWidth : 1;

  const strokeNew = { ...shape, strokeWidth: strokeWidthEnsured };
  return {
    ...strokeNew,
    x: x + strokeWidthEnsured,
    y: y + strokeWidthEnsured,
    width: Math.abs(width - 2 * strokeWidthEnsured),
    height: Math.abs(height - 2 * strokeWidthEnsured),
  };
};
export default strokeInset;
