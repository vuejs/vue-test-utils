import Vue, { VNodeData, Component, ComponentOptions, FunctionalComponentOptions } from 'vue'

/**
 * Utility type to declare an extended Vue constructor
 */
type VueClass<V extends Vue> = (new (...args: any[]) => V) & typeof Vue

/**
 * Utility type for a selector
 */
type Selector = string | Component

/**
 * Utility type for slots
 */
type Slots = {
  [key: string]: (Component | string)[] | Component | string
}

/**
 * Utility type for stubs which can be a string of template as a shorthand
 * If it is an array of string, the specified children are replaced by blank components
 */
type Stubs = {
  [key: string]: Component | string | true
} | string[]

/**
 * Utility type for ref options object that can be used as a Selector
 */
type RefSelector = {
  ref: string
}

/**
 * Base class of Wrapper and WrapperArray
 * It has common methods on both Wrapper and WrapperArray
 */
interface BaseWrapper {
  contains (selector: Selector): boolean
  exists (): boolean

  hasAttribute (attribute: string, value: string): boolean
  hasClass (className: string): boolean
  hasProp (prop: string, value: any): boolean
  hasStyle (style: string, value: string): boolean

  is (selector: Selector): boolean
  isEmpty (): boolean
  isVueInstance (): boolean

  update (): void
  setComputed (computed: object): void
  setData (data: object): void
  setMethods (data: object): void
  setProps (props: object): void
  trigger (eventName: string, options?: object): void
  destroy (): void
}

interface Wrapper<V extends Vue> extends BaseWrapper {
  readonly vm: V
  readonly element: HTMLElement
  readonly options: WrapperOptions

  find<R extends Vue, Ctor extends VueClass<R> = VueClass<R>> (selector: Ctor): Wrapper<R>
  find<R extends Vue> (selector: ComponentOptions<R>): Wrapper<R>
  find (selector: FunctionalComponentOptions): Wrapper<Vue>
  find (selector: string): Wrapper<Vue>
  find (selector: RefSelector): Wrapper<Vue>

  findAll<R extends Vue, Ctor extends VueClass<R> = VueClass<R>> (selector: Ctor): WrapperArray<R>
  findAll<R extends Vue> (selector: ComponentOptions<R>): WrapperArray<R>
  findAll (selector: FunctionalComponentOptions): WrapperArray<Vue>
  findAll (selector: string): WrapperArray<Vue>
  findAll (selector: RefSelector): WrapperArray<Vue>

  html (): string
  text (): string
  name (): string

  emitted (): { [name: string]: Array<Array<any>> }
  emittedByOrder (): Array<{ name: string, args: Array<any> }>
}

interface WrapperArray<V extends Vue> extends BaseWrapper {
  readonly length: number
  readonly wrappers: Array<Wrapper<V>>

  at (index: number): Wrapper<V>
}

interface WrapperOptions {
  attachedToDocument: boolean
}

interface MountOptions<V extends Vue> extends ComponentOptions<V> {
  attachToDocument?: boolean
  clone?: boolean
  context?: VNodeData
  localVue?: typeof Vue
  mocks?: object
  slots?: Slots
  stubs?: Stubs,
  attrs?: object
  listeners?: object
}

type ShallowOptions<V extends Vue> = MountOptions<V>

export declare function createLocalVue (): typeof Vue

export declare function mount<V extends Vue, Ctor extends VueClass<V> = VueClass<V>> (component: Ctor, options?: MountOptions<V>): Wrapper<V>
export declare function mount<V extends Vue> (component: ComponentOptions<V>, options?: MountOptions<V>): Wrapper<V>
export declare function mount (component: FunctionalComponentOptions, options?: MountOptions<Vue>): Wrapper<Vue>

export declare function shallow<V extends Vue, Ctor extends VueClass<V> = VueClass<V>> (component: Ctor, options?: ShallowOptions<V>): Wrapper<V>
export declare function shallow<V extends Vue> (component: ComponentOptions<V>, options?: ShallowOptions<V>): Wrapper<V>
export declare function shallow (component: FunctionalComponentOptions, options?: ShallowOptions<Vue>): Wrapper<Vue>
