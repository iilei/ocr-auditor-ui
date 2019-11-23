const snapToTop = (options: GapDistributionOptions & SnapToOuterOptions) => {
  const { snappy, outerBox, innerBox, kindOf } = options;

  if (kindOf === 'words' && snappy) {
    const padTop = Math.abs(outerBox.y - innerBox.y);
    return {
      ...options,
      innerBox: { ...innerBox, y: innerBox.y - padTop, height: innerBox.height + padTop },
    };
  }
  return options;
};

export default snapToTop;
