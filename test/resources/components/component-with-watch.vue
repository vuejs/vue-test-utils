<template>
  <div>
    {{prop1}}
    {{prop2}}
  </div>
</template>

<script>
  export default {
    data: function () {
      return {
        data1: 'default data1',
        data2: 'default data2'
      }
    },
    props: {
      prop1: { default: 'default prop1' },
      prop2: { default: 'default prop2' }
    },
    computed: {
      computed1: () => 'some value'
    },
    watch: {
      prop1 (val) {
        this.prop2 = val
      },
      prop2 () {
        console.info(this.prop1)
      },
      data1 (val) {
        this.data2 = val
      },
      data2 () {
        console.info(this.data1)
      },
      computed1 () {
        console.info(this.computed1)
      }
    }
  }
</script>
