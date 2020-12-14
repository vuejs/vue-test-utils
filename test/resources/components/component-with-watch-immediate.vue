<template>
  <div>
    {{ prop1 }}
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      data1: null
    }
  },
  props: ['prop1'],
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
