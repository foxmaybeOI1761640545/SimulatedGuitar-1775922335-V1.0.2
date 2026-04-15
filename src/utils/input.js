function normalizeKey(key) {
  if (!key) {
    return null;
  }
  if (key === " ") {
    return " ";
  }
  return key.toLowerCase();
}

function isTextInput(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export {
  isTextInput,
  normalizeKey
};
