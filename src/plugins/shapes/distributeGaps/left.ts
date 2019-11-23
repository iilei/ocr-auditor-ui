const left = (options: GapDistributionOptions & SnapToOuterOptions) => {
  const { outerBox, innerBox, prev } = options;
  const { height, y } = outerBox;
  let adjustedX = innerBox.x;

  let leftPad = 0;
  if (prev) {
    leftPad = (innerBox.x - (prev.x + prev.width)) / 2;
  }

  const newInnerBox = { ...innerBox, width: innerBox.width + leftPad, height, x: innerBox.x - leftPad, y };
  return { ...options, innerBox: newInnerBox };
};

export default left;
