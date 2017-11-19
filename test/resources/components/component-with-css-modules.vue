<template>
    <div :class="$style['extension']"></div>
</template>

<style module>
  .color-red {
    color: red;
  }

  .extension {
    composes: color-red;
    background: blue;
  }
</style>

<script>
  export default{
    name: 'component-with-css-modules'
  }
</script>
