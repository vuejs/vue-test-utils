<template>
  <div>
    <span>
      <slot-component prop1="foobar" prop2="fizzbuzz" />
      <child-component prop1="foobar" prop2="fizzbuzz" />
      <original-component prop1="foobar" prop2="fizzbuzz" />
    </span>
  </div>
</template>

<script>
import ComponentWithProps from './component-with-props.vue'

export default {
  name: 'component-with-nested-children',
  components: {
    ChildComponent: ComponentWithProps,
    SlotComponent: ComponentWithProps,
    OriginalComponent: ComponentWithProps
  }
}
</script>
