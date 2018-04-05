<template>
  <div>
    <div id="scopedSlots">
      <slot name="item"
            v-for="(item, index) in items"
            :text="item.text"
            :index="index">
      </slot>
    </div>
    <div id="slots">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'component-with-scoped-slots',
    data () {
      return {
        items: [{ text: 'a1' }, { text: 'a2' }, { text: 'a3' }]
      }
    }
  }
</script>
