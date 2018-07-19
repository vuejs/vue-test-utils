<template>
  <div><span baz="qux">{{ fromLocalVue }},{{ bar }}</span></div>
</template>

<script>
  export default{
    name: 'component-with-parent-name',
    props: ['fromLocalVue'],
    data () {
      return {
        bar: 'quux'
      }
    },
    mounted () {
      this.$parent.childComponentName = this.$options.name
    }
  }
</script>
