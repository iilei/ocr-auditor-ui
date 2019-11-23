const right = (options: GapDistributionOptions & SnapToOuterOptions) => {
  const { innerBox, next } = options;

  let gap = 0;
  if (next) {
    const gap = next.x - (innerBox.x + innerBox.width);
  }

  const newInnerBox = { ...innerBox, width: innerBox.width + gap };
  return { ...options, innerBox: newInnerBox };
};

export default right;
