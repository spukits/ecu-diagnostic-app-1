// Παίρνει το τρέχον brand από το CSS
export function brandColor() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--brand')
    .trim() || '#00BCD4';
}

// Αν τα animations στα charts είναι ενεργά
export function chartAnimate() {
  return document.documentElement.dataset.chartAnimations === '1';
}

// Αν οι πίνακες είναι σε compact mode
export function isTableCompact() {
  return document.documentElement.dataset.tableCompact === '1';
}
