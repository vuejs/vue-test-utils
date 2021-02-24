import Vue, { ComponentOptions, FunctionalComponentOptions, CreateElement, RenderContext, VNode } from 'vue'

/**
 * Normal component options
 */
export interface Normal extends Vue {
  foo: string
}
export const normalOptions: ComponentOptions<Normal> = {
  name: 'normal',
  data () {
    return {
      foo: 'bar'
    }
  }
}

export const extendedNormalComponent = Vue.extend({
  name: 'normal',
  data() {
    return {
      foo: 'bar'
    }
  }
})

/**
 * Functional component options
 */
export const functionalOptions: FunctionalComponentOptions = {
  functional: true,
  render (h) {
    return h('div')
  }
}

/**
 * Functional component with Vue.extend()
 */
export const extendedFunctionalComponent = Vue.extend({
  functional: true,
  render: (createElement: CreateElement, context: RenderContext): VNode => {
    return createElement('div')
  }
})

/**
 * Component constructor declared with vue-class-component etc.
 */
export class ClassComponent extends Vue {
  bar = 'bar'
}
