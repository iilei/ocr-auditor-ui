import snapToLeft from './snapToLeft';

const snapToOuter = (options: GapDistributionOptions, snapOptions: SnapToOuterOptions = {}) => {
  const combinedOptions = { ...options, ...snapOptions };
  return snapToLeft(combinedOptions);
};

export default snapToOuter;
