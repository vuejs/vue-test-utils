<template>
  <div foo="bar"><span baz="qux">{{ quux }}</span></div>
</template>

<script>
  export default{
    name: 'component-with-parent-name',
    data () {
      return {
        quux: 'quux'
      }
    },
    mounted () {
      this.$parent.childName = this.$options.name
    }
  }
</script>
