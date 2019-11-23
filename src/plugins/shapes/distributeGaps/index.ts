import fillLeft from './left';
import fillRight from './right';

const distributeGaps = (options: GapDistributionOptions, snapOptions: SnapToOuterOptions = {}) => {
  const combinedOptions = { ...options, ...snapOptions };
  return fillRight(fillLeft(combinedOptions));
};

export default distributeGaps;
