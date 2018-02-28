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
 * Utility type for stubs which can be a string of template as a shorthand
 * If it is an array of string, the specified children are replaced by blank components
 */
type Stubs = {
  [key: string]: Component | string | true
} | string[]

/**
 * Utility type for slots
 */
type Slots = {
  [key: string]: (Component | string)[] | Component | string
}

interface MountOptions<V extends Vue> extends ComponentOptions<V> {
  attachToDocument?: boolean
  context?: VNodeData
  localVue?: typeof Vue
  mocks?: object
  slots?: Slots
  stubs?: Stubs,
  attrs?: object
  listeners?: object
}

type ThisTypedMountOptions<V extends Vue> = MountOptions<V> & ThisType<V>

type ShallowOptions<V extends Vue> = MountOptions<V>

type ThisTypedShallowOptions<V extends Vue> = ShallowOptions<V> & ThisType<V>

interface VueTestUtilsConfigOptions {
  stubs?: Stubs
}

export declare let config: VueTestUtilsConfigOptions

export declare function renderToString<V extends Vue> (component: VueClass<V>, options?: ThisTypedMountOptions<V>): string
export declare function renderToString<V extends Vue> (component: ComponentOptions<V>, options?: ThisTypedMountOptions<V>): string
export declare function renderToString (component: FunctionalComponentOptions, options?: MountOptions<Vue>): string
