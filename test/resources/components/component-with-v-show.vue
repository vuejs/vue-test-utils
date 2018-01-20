<template>
  <div v-show="rootReady">
    <div v-show="!ready" class="not-ready">not-ready</div>

    <div v-show="ready" class="parent ready">
      <div class="child ready">ready</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'component-with-show',
    data: () => ({
      ready: false,
      rootReady: true
    })
  }
</script>
