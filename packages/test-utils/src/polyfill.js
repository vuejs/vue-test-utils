export default function polyfill() {
  // Polyfill `Element.matches()` for IE and older versions of Chrome:
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector
  }
}
