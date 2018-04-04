<template>
  <div>
    <slot name="item"
          v-for="(item, index) in items"
          :text="item.text"
          :index="index">
    </slot>
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
