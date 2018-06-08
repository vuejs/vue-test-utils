// @flow
import Vue from 'vue'

export function throwError (msg: string) {
  throw new Error(`[vue-test-utils]: ${msg}`)
}

export function warn (msg: string) {
  console.error(`[vue-test-utils]: ${msg}`)
}

const camelizeRE = /-(\w)/g
export const camelize = (str: string) => {
  const camelizedStr = str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
  return camelizedStr.charAt(0).toLowerCase() + camelizedStr.slice(1)
}

/**
 * Capitalize a string.
 */
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = (str: string) => str.replace(hyphenateRE, '-$1').toLowerCase()

export const vueVersion = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`)

export const htmlTags = [
  'html', 'body', 'base','head','link','meta','style','title',
  'address','article','aside','footer','header','h1','h2','h3','h4','h5','h6',
  'hgroup','nav','section','div','dd','dl','dt','figcaption','figure','picture','hr',
  'img','li','main','ol','p', 'pre','ul',
  'a','b','abbr','bdi','bdo','br','cite','code','data','dfn',
  'em','i', 'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby',
  's','samp', 'small', 'span', 'strong', 'sub', 'sup', 'time',
  'u', 'var', 'wbr', 'area', 'audio', 'map', 'track', 'video',
  'embed','object', 'param', 'source', 'canvas', 'script', 
  'noscript', 'del', 'ins', 'caption', 'col', 'colgroup', 'table', 
  'thead', 'tbody', 'td', 'th', 'tr', 'button', 'datalist', 'fieldset', 
  'form', 'input', 'label', 'legend', 'meter', 'optgroup', 'option',
  'output', 'progress', 'select', 'textarea', 'details', 'dialog', 'menu', 
  'menuitem', 'summary', 'content', 'element', 'shadow', 'template', 'blockquote', 'iframe', 'tfoot'
]

export const svgElements = [
  'svg', 'animate', 'circle', 'clippath', 'cursor', 'defs', 'desc', 'ellipse', 'filter', 'font-face',
  'foreignObject', 'g', 'glyph', 'image', 'line', 'marker', 'mask', 'missing-glyph', 'path', 'pattern',
  'polygon', 'polyline', 'rect', 'switch', 'symbol', 'text', 'textpath', 'tspan', 'use', 'view'
]
