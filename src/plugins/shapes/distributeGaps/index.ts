import left from './left';
import right from './right';
import snapToOuter from './snapToOuter';

const leftRight = (options: GapDistributionOptions, snapOptions: SnapToOuterOptions = {}) => {
  const combinedOptions = { ...options, ...snapOptions };
  return snapToOuter(combinedOptions);
};

export { leftRight };
