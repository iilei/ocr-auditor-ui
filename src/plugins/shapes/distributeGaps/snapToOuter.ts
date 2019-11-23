const snapToOuter = (options: GapDistributionOptions & SnapToOuterOptions) => {
  const { snapLeft, prev, outerBox, innerBox, kindOf } = options;

  if (!prev || (kindOf !== 'words' && snapLeft)) {
    const padLeft = Math.abs(outerBox.x - innerBox.x);
    return { ...options, innerBox: { ...innerBox, x: innerBox.x - padLeft, width: innerBox.width + padLeft } };
  }
  return options;
};

export default snapToOuter;
