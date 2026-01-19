export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickOne(items) {
  return items[randInt(0, items.length - 1)];
}

export function nowTs() {
  return Date.now();
}
