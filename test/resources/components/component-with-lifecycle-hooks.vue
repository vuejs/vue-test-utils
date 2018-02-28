<template>
  <div />
</template>

<script>
  export default{
    name: 'component-with-lifecycle-hooks',
    beforeCreate () {
      console.info()
    },
    created () {
      console.info()
    },
    beforeMount () {
      console.info()
    },
    mounted () {
      console.info()
    },
    beforeUpdate () {
      console.info()
    },
    updated () {
      console.info()
    },
    beforeDestroy () {
      console.info()
    },
    destroyed () {
      console.info()
    },
    activated () {
      console.info()
    },
    deactivated () {
      console.info()
    }
  }
</script>
