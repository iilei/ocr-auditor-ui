const left = (options: GapDistributionOptions & SnapToOuterOptions) => {
  const { innerBox, prev, kindOf } = options;

  if (!prev || kindOf !== 'words') {
    return options;
  }
  // the gap side which is adjusted first politely only takes half the gap space
  const gap = Math.abs(prev.x + prev.width - innerBox.x) / 2;

  const newInnerBox = { ...innerBox, width: innerBox.width + gap, x: innerBox.x - gap };
  return { ...options, innerBox: newInnerBox };
};

export default left;
