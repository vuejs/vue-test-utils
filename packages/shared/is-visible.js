/*!
 * isElementVisible
 * Ported from https://github.com/testing-library/jest-dom
 * Licensed under the MIT License.
 */

function isStyleVisible(element) {
  if (
    !(element instanceof window.HTMLElement) &&
    !(element instanceof window.SVGElement)
  ) {
    return false
  }

  // Per https://lists.w3.org/Archives/Public/www-style/2018May/0031.html
  // getComputedStyle should only work with connected elements.
  const { display, visibility, opacity } = element.isConnected
    ? getComputedStyle(element)
    : element.style
  return (
    display !== 'none' &&
    visibility !== 'hidden' &&
    visibility !== 'collapse' &&
    opacity !== '0' &&
    opacity !== 0
  )
}

function isAttributeVisible(element, previousElement) {
  return (
    !element.hasAttribute('hidden') &&
    (element.nodeName === 'DETAILS' && previousElement.nodeName !== 'SUMMARY'
      ? element.hasAttribute('open')
      : true)
  )
}

export function isElementVisible(element, previousElement) {
  return (
    element.nodeName !== '#comment' &&
    isStyleVisible(element) &&
    isAttributeVisible(element, previousElement) &&
    (!element.parentElement || isElementVisible(element.parentElement, element))
  )
}
