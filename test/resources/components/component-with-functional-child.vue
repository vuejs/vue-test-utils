<template>
  <functional-component
    :class="['baz', { bar: a + b === 2, foo: a === 1, qux: a === 2 }]"
    v-text="something"
    @click="handleFunctionalComponentClick"
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
      b: 1,
      something: 'value'
    }
  },

  methods: {
    handleFunctionalComponentClick() {
      this.something = 'newValue'
    }
  }
}
</script>
