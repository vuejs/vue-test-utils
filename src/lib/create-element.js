// @flow

export default function createElement (): HTMLElement | void {
  if (document) {
    const elem = document.createElement('div')

    if (document.body) {
      document.body.appendChild(elem)
    }
    return elem
  }
}
