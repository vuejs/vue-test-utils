<template>
  <div>
    <input type="text" v-model="inputValue">
  </div>
</template>

<script>
  export default{
    name: 'component-with-input',
    data() {
      return {
        inputValue: undefined
      }
    }
  }
</script>
