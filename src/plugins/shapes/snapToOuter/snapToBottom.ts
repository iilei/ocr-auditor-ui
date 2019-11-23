const snapToBottom = (options: GapDistributionOptions & SnapToOuterOptions) => {
  const { snappy, outerBox, innerBox, kindOf } = options;

  if (kindOf === 'words' && snappy) {
    const padBottom = Math.abs(outerBox.height - innerBox.height);
    return {
      ...options,
      innerBox: { ...innerBox, height: innerBox.height + padBottom },
    };
  }
  return options;
};

export default snapToBottom;
