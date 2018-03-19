// @flow

import renderToString from './renderToString'
import cheerio from 'cheerio'

export default function render (component: Component, options: Options = {}): string {
  const renderedString = renderToString(component, options)
  return cheerio.load('')(renderedString)
}
