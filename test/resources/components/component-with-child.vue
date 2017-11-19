<template>
  <div>
    <span>
      <child-component ref="child"/>
    </span>
  </div>
</template>

<script>
  import ChildComponent from './component.vue'

  export default{
    name: 'component-with-child',
    components: {
      ChildComponent
    }
  }
</script>
