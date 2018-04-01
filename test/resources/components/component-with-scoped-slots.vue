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
        items: [
          {
            text: 'text1'
          },
          {
            text: 'text2'
          },
          {
            text: 'text3'
          }
        ]
      }
    }
  }
</script>
