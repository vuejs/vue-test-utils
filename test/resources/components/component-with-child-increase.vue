<template>
  <div>
    <span id="span">
      <child-component ref="child"/>
      <div>foo</div>
    </span>
  </div>
</template>

<script>
  import ChildComponent from './component-increase.vue'

  export default{
    name: 'component-with-child',
    components: {
      ChildComponent
    }
  }
</script>
