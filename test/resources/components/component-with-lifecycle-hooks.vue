<template>
    <div />
</template>

<script>
    export default{
      name: 'component-with-lifecycle-hooks',
      beforeCreate () {
        console.log()
      },
      created () {
        console.log()
      },
      beforeMount () {
        console.log()
      },
      mounted () {
        console.log()
      },
      beforeUpdate () {
        console.log()
      },
      updated () {
        console.log()
      },
      beforeDestroy () {
        console.log()
      },
      destroyed () {
        console.log()
      },
      activated () {
        console.log()
      },
      deactivated () {
        console.log()
      }
    }
</script>
