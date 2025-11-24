export const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const normalize = (value, min, max) => {
  if (max - min === 0) return 0;
  return clamp((value - min) / (max - min), 0, 1);
};

export const rollingAverage = (values) => {
  if (!values.length) return 0;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
};

export const rollingVariance = (values) => {
  if (values.length <= 1) return 0;
  const avg = rollingAverage(values);
  const variance = values.reduce((acc, value) => acc + (value - avg) ** 2, 0) / values.length;
  return variance;
};
