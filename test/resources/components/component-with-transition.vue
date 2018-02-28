<template>
  <transition>
    <div>{{a}}</div>
  </transition>
</template>

<script>
  export default{
    name: 'component-with-transition',
    data: () => ({
      a: 'a'
    })
  }
</script>
