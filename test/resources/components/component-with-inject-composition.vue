<template>
  <div>{{ fromMount }}</div>
</template>

<script>
import { defineComponent, inject, ref } from 'vue'

export default defineComponent({
  name: 'component-with-inject-composition',
  setup: () => {
    const fromMount = inject('fromMount')
    const setInSetup = ref('created')

    return {
      fromMount,
      setInSetup
    }
  }
})
</script>
