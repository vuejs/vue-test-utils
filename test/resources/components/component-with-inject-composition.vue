<template>
  <div>{{ fromMount }}</div>
</template>

<script>
import { createComponent, inject, ref } from '@vue/composition-api'

export default createComponent({
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
