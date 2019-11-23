const snapToOuter = (options: GapDistributionOptions & SnapToOuterOptions) => {
  const { snapLeft, prev, outerBox, innerBox } = options;
  if (!prev && snapLeft) {
    const padLeft = outerBox.x - innerBox.x;
    console.log(options);

    return { ...options, innerBox: { ...innerBox, x: innerBox.x - padLeft, width: innerBox.width + padLeft } };
  }
  return options;
};

export default snapToOuter;
