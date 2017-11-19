<template>
  <div @click="inc">{{ count }} {{ bar }}</div>
</template>

<script>
  export default {
    computed: {
      count () {
        return this.$store.state.count
      },
      bar () {
        return this.$store.state.foo.bar
      }
    },
    methods: {
      inc () {
        this.$store.commit('increment')
      }
    }
  }
</script>
