<template>
  <div>
    <span>
      <slot-component>
        <template v-slot:newSyntax>
          <child-component prop1="foobar" prop2="fizzbuzz" />
        </template>
      </slot-component>
    </span>
  </div>
</template>

<script>
import ComponentWithProps from './component-with-props.vue'
import ComponentWithSlots from './component-with-v-slot.vue'

export default {
  name: 'component-with-nested-children',
  components: {
    ChildComponent: ComponentWithProps,
    SlotComponent: ComponentWithSlots
  }
}
</script>
