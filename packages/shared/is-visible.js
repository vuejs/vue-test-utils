/*!
 * isElementVisible
 * Ported from https://github.com/testing-library/jest-dom
 * Licensed under the MIT License.
 */

function isStyleVisible(element) {
  const { display, visibility, opacity } = element.style
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
