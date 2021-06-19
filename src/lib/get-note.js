export const getNote = (value = 0) => {
  return ['C', 'D', 'E', 'F', 'G', 'A', 'B'][value - 1];
};