<template>
  <div>
    <transition>
      <span v-if="!expanded" data-testid="expanded"> Content </span>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'component-with-transitions',
  data() {
    return {
      expanded: false
    }
  }
}
</script>
