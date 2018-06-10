import Vue, { VNodeData, ComponentOptions, FunctionalComponentOptions } from 'vue'

// TODO: use core repo's Component type after https://github.com/vuejs/vue/pull/7369 is released
export type Component =
  | typeof Vue
  | FunctionalComponentOptions<{}>
  | ComponentOptions<never, {}, {}, {}, {}>

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
 * Utility type for name options object that can be used as a Selector
 */
type NameSelector = {
  name: string
}

/**
 * Base class of Wrapper and WrapperArray
 * It has common methods on both Wrapper and WrapperArray
 */
interface BaseWrapper {
  contains (selector: Selector): boolean
  exists (): boolean
  isVisible (): boolean
  visible (): boolean

  attributes(): { [name: string]: string }
  classes(): Array<string>
  props(): { [name: string]: any }

  hasAttribute (attribute: string, value: string): boolean
  hasClass (className: string): boolean
  hasProp (prop: string, value: any): boolean
  hasStyle (style: string, value: string): boolean

  is (selector: Selector): boolean
  isEmpty (): boolean
  isVueInstance (): boolean

  setComputed (computed: object): void
  setData (data: object): void
  setMethods (data: object): void
  setProps (props: object): void

  setValue (value: any): void
  setChecked (checked: boolean): void
  setSelected (): void

  trigger (eventName: string, options?: object): void
  destroy (): void
}

export interface Wrapper<V extends Vue> extends BaseWrapper {
  readonly vm: V
  readonly element: HTMLElement
  readonly options: WrapperOptions

  find<R extends Vue> (selector: VueClass<R>): Wrapper<R>
  find<R extends Vue> (selector: ComponentOptions<R>): Wrapper<R>
  find (selector: FunctionalComponentOptions): Wrapper<Vue>
  find (selector: string): Wrapper<Vue>
  find (selector: RefSelector): Wrapper<Vue>
  find (selector: NameSelector): Wrapper<Vue>

  findAll<R extends Vue> (selector: VueClass<R>): WrapperArray<R>
  findAll<R extends Vue> (selector: ComponentOptions<R>): WrapperArray<R>
  findAll (selector: FunctionalComponentOptions): WrapperArray<Vue>
  findAll (selector: string): WrapperArray<Vue>
  findAll (selector: RefSelector): WrapperArray<Vue>
  findAll (selector: NameSelector): WrapperArray<Vue>

  html (): string
  text (): string
  name (): string
  setSelected(): void

  emitted (event?: string): { [name: string]: Array<Array<any>> }
  emittedByOrder (): Array<{ name: string, args: Array<any> }>
}

export interface WrapperArray<V extends Vue> extends BaseWrapper {
  readonly length: number
  readonly wrappers: Array<Wrapper<V>>

  at (index: number): Wrapper<V>
  filter (predicate: Function): WrapperArray<Vue>
}

interface WrapperOptions {
  attachedToDocument: boolean
  sync: boolean
}

interface MountOptions<V extends Vue> extends ComponentOptions<V> {
  attachToDocument?: boolean
  context?: VNodeData
  localVue?: typeof Vue
  mocks?: object
  slots?: Slots
  scopedSlots?: Record<string, string>
  stubs?: Stubs,
  attrs?: Record<string, string>
  listeners?: Record<string, Function | Function[]>
  sync?: boolean
}

type ThisTypedMountOptions<V extends Vue> = MountOptions<V> & ThisType<V>

type ShallowMountOptions<V extends Vue> = MountOptions<V>

type ThisTypedShallowMountOptions<V extends Vue> = ShallowMountOptions<V> & ThisType<V>

interface VueTestUtilsConfigOptions {
  stubs?: Stubs
  mocks?: object
  methods?: Record<string, Function>
  provide?: object,
  logModifiedComponents?: Boolean
}

export declare function createLocalVue (): typeof Vue
export declare let config: VueTestUtilsConfigOptions

export declare function mount<V extends Vue> (component: VueClass<V>, options?: ThisTypedMountOptions<V>): Wrapper<V>
export declare function mount<V extends Vue> (component: ComponentOptions<V>, options?: ThisTypedMountOptions<V>): Wrapper<V>
export declare function mount (component: FunctionalComponentOptions, options?: MountOptions<Vue>): Wrapper<Vue>

export declare function shallowMount<V extends Vue> (component: VueClass<V>, options?: ThisTypedShallowMountOptions<V>): Wrapper<V>
export declare function shallowMount<V extends Vue> (component: ComponentOptions<V>, options?: ThisTypedShallowMountOptions<V>): Wrapper<V>
export declare function shallowMount (component: FunctionalComponentOptions, options?: ShallowMountOptions<Vue>): Wrapper<Vue>

export declare let TransitionStub: Component | string | true
export declare let TransitionGroupStub: Component | string | true
export declare let RouterLinkStub: VueClass<Vue>
