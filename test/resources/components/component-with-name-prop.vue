<template>
  <div>
    <p class="prop-name">{{ name }}</p>
  </div>
</template>

<script>
export default {
  name: 'component-with-name-prop',
  props: ['name']
}
</script>
