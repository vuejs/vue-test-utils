<template>
  <div>
    <span>
      <child-component />
      <component-with-lifecycle-hooks />
    </span>
  </div>
</template>

<script>
  import ComponentWithChild from './component-with-child.vue'
  import ComponentWithLifecycleHooks from './component-with-lifecycle-hooks.vue'

  export default{
    name: 'component-with-nested-children',
    components: {
      ChildComponent: ComponentWithChild,
      ComponentWithLifecycleHooks
    }
  }
</script>
