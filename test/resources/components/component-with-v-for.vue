<template>
  <div>
    <AComponent v-for="item in items" :key="item.id" ref="item"/>
  </div>
</template>

<script>
  import AComponent from './component.vue'

  export default {
    name: 'component-with-v-for',
    components: {
      AComponent
    },
    props: ['items']
  }
</script>
