<template>
    <div />
</template>

<script>
    export default{
      name: 'component-with-lifecycle-hooks',
      beforeCreate () {
        console.time()
      },
      created () {
        console.time()
      },
      beforeMount () {
        console.time()
      },
      mounted () {
        console.time()
      },
      beforeUpdate () {
        console.time()
      },
      updated () {
        console.time()
      },
      beforeDestroy () {
        console.time()
      },
      destroyed () {
        console.time()
      },
      activated () {
        console.time()
      },
      deactivated () {
        console.time()
      }
    }
</script>
