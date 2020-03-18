<template>
  <functional-component
    :class="{ bar: a + b === 2, foo: a === 1, qux: a === 2 }"
  />
</template>

<script>
import FunctionalComponent from './functional-component.vue'

export default {
  components: {
    FunctionalComponent
  },

  data() {
    return {
      a: 1,
      b: 1
    }
  }
}
</script>
