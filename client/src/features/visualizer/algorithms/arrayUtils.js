// Assigns a stable id (its original position) to each value in a fresh
// array. The step-generators carry this id through every swap/copy, and
// the UI keys each bar by id — so React keeps the same DOM node across
// steps and the browser can animate its `left` position changing,
// instead of the value just repainting in place with a new color.
export function makeIdArray(input) {
  return input.map((value, i) => ({ id: i, value }));
}
