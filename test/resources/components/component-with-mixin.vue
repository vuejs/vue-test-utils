<template>
    <div />
</template>

<script>
    import testMixin from '../testMixin'

export default {
      name: 'MixinComponent',
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
