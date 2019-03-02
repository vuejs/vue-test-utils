// @flow

import renderToString from './renderToString'
import cheerio from 'cheerio'

export default async function render(
  component: Component,
  options: Options = {}
): Promise<string> {
  const renderedString = await renderToString(component, options)
  return cheerio.load('')(renderedString)
}
