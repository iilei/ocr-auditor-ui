import { bbox, bboxReverse } from './shape';

const bboxExample = [
  [36, 92],
  [580, 122],
];

const konvaShapeExample = {
  height: 30,
  width: 544,
  x: 36,
  y: 92,
};

describe('bbox', function() {
  it('converts the hocr format to Konva Shape properties', () => {
    const result = bbox(bboxExample);
    expect(result).toEqual(konvaShapeExample);
  });
  it('converts Konva Shape properties to hocr format', () => {
    const result = bboxReverse(konvaShapeExample);
    expect(result).toEqual(bboxExample);
  });
});
