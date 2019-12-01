const right = (options: GapDistributionOptions & SnapToOuterOptions) => {
  const { innerBox, next, kindOf, padding = {} } = options;

  if (kindOf !== 'words') {
    return options;
  }
  if (!next) {
    return { ...options, innerBox: { ...innerBox, width: innerBox.width + (padding.lineEnd || 0) } };
  }

  const gap = Math.floor(Math.abs(next.x - (innerBox.x + innerBox.width)) / 2);

  const newInnerBox = { ...innerBox, width: innerBox.width + gap };
  return { ...options, innerBox: newInnerBox };
};

export default right;
