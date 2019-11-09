// @flow

import renderToString from './renderToString'
import cheerio from 'cheerio'

export default function render(
  component: Component,
  options: Options = {}
): Promise<string> {
  return renderToString(component, options).then(str => cheerio.load('')(str))
}
