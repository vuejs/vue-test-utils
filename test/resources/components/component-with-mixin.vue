<template>
  <div />
</template>

<script>
  import testMixin from '../testMixin'

  export default {
    name: 'component-with-mixin',
    mixins: [testMixin],
    created () {
      this.someMethod()
    },
    methods: {
      someMethod () {
        console.log('testMethod') // eslint-disable-line no-console
      }
    }
  }
</script>
