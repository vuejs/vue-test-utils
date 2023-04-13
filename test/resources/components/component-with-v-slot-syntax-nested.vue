<template>
  <div>
    <ComponentWithVSlot>
      <template v-slot:newSyntax>
        <p class="new-example">new slot syntax</p>
      </template>
    </ComponentWithVSlot>
  </div>
</template>

<script>
import ComponentWithVSlot from './component-with-v-slot.vue'

export default {
  name: 'ComponentWithVSlotSyntaxNested',

  components: { ComponentWithVSlot }
}
</script>
