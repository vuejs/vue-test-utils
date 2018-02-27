<template>
  <transition-group>
    <div>{{a}}</div>
    <div></div>
  </transition-group>
</template>

<script>
  export default{
    name: 'component-with-transition',
    data: () => ({
      a: 'a'
    })
  }
</script>
