const snapToLeft = (options: GapDistributionOptions & SnapToOuterOptions) => {
  const { snapLeft, prev, outerBox, innerBox, kindOf, padding } = options;
  const { left: leftOffset } = padding || {};

  let offset = 0;
  if (kindOf === 'careas') {
    offset = innerBox.x - (leftOffset || 0);
  }

  if (!prev || (kindOf !== 'words' && snapLeft)) {
    const padLeft = Math.abs(outerBox.x - innerBox.x);
    return {
      ...options,
      innerBox: { ...innerBox, x: innerBox.x - padLeft + offset, width: innerBox.width + padLeft - offset },
    };
  }
  return options;
};

export default snapToLeft;
