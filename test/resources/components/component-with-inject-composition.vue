<template>
  <div>
    {{ fromMount }}
  </div>
</template>

<script>
import {
  createComponent,
  reactive,
  toRefs,
  onMounted,
  inject
} from '@vue/composition-api'

export default createComponent({
  name: 'component-with-inject-composition',
  setup: () => {
    const fromMount = inject('fromMount')
    const setInBeforeCreate = 'created'

    return {
      fromMount,
      setInBeforeCreate
    }
  }
})
</script>
