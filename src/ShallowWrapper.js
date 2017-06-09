// @flow

export default class ShallowWrapper implements BaseWrapper {
  vnode: VNode;
  vm: Component | null;
  isVueComponent: boolean;

  constructor (vnode: VNode) {
    this.vnode = vnode
  }

  at (): void {
    throw new Error('at() is not currently supported in shallow render')
  }

  contains (): void {
    throw new Error('contains() is not currently supported in shallow render')
  }

  hasAttribute (attribute: string, value: string) {
    if (typeof attribute !== 'string') {
      throw new Error('wrapper.hasAttribute() must be passed attribute as a string')
    }

    if (typeof value !== 'string') {
      throw new Error('wrapper.hasAttribute() must be passed value as a string')
    }

    return !!(this.vnode.data && this.vnode.data.attrs && this.vnode.data.attrs[attribute] === value)
  }

  hasClass (): void {
    throw new Error('hasClass() is not currently supported in shallow render')
  }

  hasProp (): void {
    throw new Error('hasProp() is not currently supported in shallow render')
  }

  hasStyle (): void {
    throw new Error('hasStyle() is not currently supported in shallow render')
  }

  findAll (): void {
    throw new Error('findAll() is not currently supported in shallow render')
  }

  find (): void {
    throw new Error('find() is not currently supported in shallow render')
  }

  html (): void {
    throw new Error('html() is not currently supported in shallow render')
  }

  is (): void {
    throw new Error('is() is not currently supported in shallow render')
  }

  isEmpty (): void {
    throw new Error('isEmpty() is not currently supported in shallow render')
  }

  isVueInstance (): boolean {
    return !!this.isVueComponent
  }

  name (): void {
    throw new Error('name() is not currently supported in shallow render')
  }

  text (): void {
    throw new Error('text() is not currently supported in shallow render')
  }

  setData (): void {
    throw new Error('setData() is not currently supported in shallow render')
  }

  setProps (): void {
    throw new Error('setProps() is not currently supported in shallow render')
  }

  trigger (): void {
    throw new Error('trigger() is not currently supported in shallow render')
  }

  update (): void {
    throw new Error('update() is not currently supported in shallow render')
  }
}
