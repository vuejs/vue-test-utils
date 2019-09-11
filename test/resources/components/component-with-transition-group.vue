<template>
  <transition-group>
    <div key="123">{{ a }}</div>
    <div key="124"></div>
  </transition-group>
</template>

<script>
export default {
  name: 'component-with-transition',
  data: () => ({
    a: 'a'
  })
}
</script>
