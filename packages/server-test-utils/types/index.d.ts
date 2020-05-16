import Vue, { VNodeData, ComponentOptions, FunctionalComponentOptions, Component } from 'vue'
import { DefaultProps, PropsDefinition } from 'vue/types/options'
import * as Cheerio from 'cheerio'

/**
 * Utility type to declare an extended Vue constructor
 */
type VueClass<V extends Vue> = (new (...args: any[]) => V) & typeof Vue

/**
 * Utility type for stubs which can be a string of template as a shorthand
 * If it is an array of string, the specified children are replaced by blank components
 */
type Stubs = {
  [key: string]: Component | string | boolean
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
  scopedSlots?: Record<string, string>
  stubs?: Stubs,
  attrs?: Record<string, string>
  listeners?: Record<string, Function | Function[]>
}

type ThisTypedMountOptions<V extends Vue> = MountOptions<V> & ThisType<V>

type ShallowOptions<V extends Vue> = MountOptions<V>

type ThisTypedShallowOptions<V extends Vue> = ShallowOptions<V> & ThisType<V>

interface VueTestUtilsConfigOptions {
  stubs?: Stubs
  mocks?: object
  methods?: Record<string, Function>
  provide?: object,
  silent?: Boolean
}

export declare let config: VueTestUtilsConfigOptions

export declare function render<V extends Vue> (component: VueClass<V>, options?: ThisTypedMountOptions<V>): Promise<Cheerio>
export declare function render<V extends Vue> (component: ComponentOptions<V>, options?: ThisTypedMountOptions<V>): Promise<Cheerio>
export declare function render<Props = DefaultProps, PropDefs = PropsDefinition<Props>>(component: FunctionalComponentOptions<Props, PropDefs>, options?: MountOptions<Vue>): Promise<Cheerio>

export declare function renderToString<V extends Vue> (component: VueClass<V>, options?: ThisTypedMountOptions<V>): Promise<string>
export declare function renderToString<V extends Vue> (component: ComponentOptions<V>, options?: ThisTypedMountOptions<V>): Promise<string>
export declare function renderToString<Props = DefaultProps, PropDefs = PropsDefinition<Props>>(component: FunctionalComponentOptions<Props, PropDefs>, options?: MountOptions<Vue>): Promise<string>
