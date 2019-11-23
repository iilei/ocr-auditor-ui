import snapToLeft from './snapToLeft';
import snapToTop from './snapToTop';
import snapToBottom from './snapToBottom';

const snapToOuter = (options: GapDistributionOptions, snapOptions: SnapToOuterOptions = {}) => {
  const combinedOptions = { ...options, ...snapOptions };
  return snapToBottom(snapToTop(snapToLeft(combinedOptions)));
};

export default snapToOuter;
