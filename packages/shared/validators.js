// @flow
import { throwError, capitalize, camelize, hyphenate } from './util'

export function isDomSelector(selector: any): boolean {
  if (typeof selector !== 'string') {
    return false
  }

  try {
    if (typeof document === 'undefined') {
      throwError(
        `mount must be run in a browser environment like ` +
          `PhantomJS, jsdom or chrome`
      )
    }
  } catch (error) {
    throwError(
      `mount must be run in a browser environment like ` +
        `PhantomJS, jsdom or chrome`
    )
  }

  try {
    document.querySelector(selector)
    return true
  } catch (error) {
    return false
  }
}

export function isVueComponent(c: any): boolean {
  if (isConstructor(c)) {
    return true
  }

  if (c === null || typeof c !== 'object') {
    return false
  }

  if (c.extends || c._Ctor) {
    return true
  }

  if (typeof c.template === 'string') {
    return true
  }

  if (typeof c.setup === 'function' && !c.render) {
    return true
  }

  return typeof c.render === 'function'
}

export function componentNeedsCompiling(component: Component): boolean {
  return (
    component &&
    !component.render &&
    (component.template || component.extends || component.extendOptions) &&
    !component.functional
  )
}

export function isRefSelector(refOptionsObject: any): boolean {
  if (
    typeof refOptionsObject !== 'object' ||
    Object.keys(refOptionsObject || {}).length !== 1
  ) {
    return false
  }

  return typeof refOptionsObject.ref === 'string'
}

export function isNameSelector(nameOptionsObject: any): boolean {
  if (typeof nameOptionsObject !== 'object' || nameOptionsObject === null) {
    return false
  }

  return !!nameOptionsObject.name
}

export function isConstructor(c: any) {
  return typeof c === 'function' && c.cid
}

export function isDynamicComponent(c: any) {
  return typeof c === 'function' && !c.cid
}

export function isComponentOptions(c: any) {
  return c !== null && typeof c === 'object' && (c.template || c.render)
}

export function isFunctionalComponent(c: any) {
  if (!isVueComponent(c)) {
    return false
  }
  if (isConstructor(c)) {
    return c.options.functional
  }
  return c.functional
}

export function templateContainsComponent(
  template: string,
  name: string
): boolean {
  return [capitalize, camelize, hyphenate].some(format => {
    const re = new RegExp(`<${format(name)}\\s*(\\s|>|(\/>))`, 'g')
    return re.test(template)
  })
}

export function isPlainObject(c: any): boolean {
  return Object.prototype.toString.call(c) === '[object Object]'
}

export function isHTMLElement(c: any): boolean {
  if (typeof HTMLElement === 'undefined') {
    return false
  }
  // eslint-disable-next-line no-undef
  return c instanceof HTMLElement
}

export function isRequiredComponent(name: string): boolean {
  return (
    name === 'KeepAlive' || name === 'Transition' || name === 'TransitionGroup'
  )
}

function makeMap(str: string, expectsLowerCase?: boolean) {
  var map = Object.create(null)
  var list = str.split(',')
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? function(val: string) {
        return map[val.toLowerCase()]
      }
    : function(val: string) {
        return map[val]
      }
}

export const isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,video,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
)

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
export const isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
)

export const isReservedTag = (tag: string) => isHTMLTag(tag) || isSVG(tag)
