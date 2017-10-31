<template>
  <div :class="$style['color-red']"></div>
</template>

<style module>
  .color-red {
    color: red;
  }
</style>

<script>
  export default{
    name: 'component-with-css-modules'
  }
</script>
