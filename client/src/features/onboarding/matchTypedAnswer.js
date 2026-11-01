const normalise = (text) => text.trim().toLowerCase();

// Lets the learner type an answer instead of tapping a card. A typed message matches an option when
// it contains the option's label ("I am preparing for tcs nqt" matches "TCS NQT") or the other way round.
export function matchTypedAnswer(text, options) {
  const typed = normalise(text);
  if (!typed) return null;
  return options.find((item) => {
    const label = normalise(item.label);
    return typed.includes(label) || label.includes(typed);
  }) ?? null;
}
