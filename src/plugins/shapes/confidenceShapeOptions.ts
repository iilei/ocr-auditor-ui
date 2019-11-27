import findByRange from './findByRange';

const confidenceShapeOptions = (
  outerShape: ShapeOptions,
  { konvaOptions, rangeOptions }: Record<'konvaOptions' | 'rangeOptions', ShapeOptions>,
  confidence: number,
) => {
  const { x, y, height, width } = outerShape;
  const newY = y + Math.max(height - konvaOptions.height, konvaOptions.height);

  const dimensions = {
    x,
    y: newY,
    height: konvaOptions.height,
    width,
  };

  // @ts-ignore
  const rangeSpecificOptions: Record<string, any> = findByRange(rangeOptions, confidence);

  return { ...konvaOptions, ...dimensions, ...rangeSpecificOptions.konvaOptions, name: 'confidence' };
};

export { confidenceShapeOptions };
