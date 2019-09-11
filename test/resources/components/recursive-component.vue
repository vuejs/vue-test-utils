<template>
  <div>
    <recursive-component
      v-for="(item, i) in items"
      :key="i"
      :items="items ? items[0] : []"
      >{{ something }}</recursive-component
    >
  </div>
</template>

<script>
export default {
  name: 'recursive-component',
  props: ['items'],
  computed: {
    something() {
      return 'value'
    }
  }
}
</script>
