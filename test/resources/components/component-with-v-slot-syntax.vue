<template>
  <ComponentWithVSlot>
    <template v-slot:newSyntax>
      <p class="new-example">new slot syntax</p>
    </template>
  </ComponentWithVSlot>
</template>

<script>
import ComponentWithVSlot from './component-with-v-slot.vue'

export default {
  name: 'ComponentWithVSlotSyntax',

  components: { ComponentWithVSlot }
}
</script>
