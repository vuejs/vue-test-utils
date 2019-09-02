<script>
export default {
  props: ['prop1'],
  data: function() {
    return {
      data1: null
    }
  },

  watch: {
    prop1: {
      handler() {
        this.data1 = this.prop1
      },
      immediate: true
    }
  }
}
</script>
<template>
  <h1>test</h1>
</template>
