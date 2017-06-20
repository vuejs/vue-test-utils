<template>
    <div>
        <span>
            <child-component />
            <component-with-lifecycle-hooks />
        </span>
    </div>
</template>

<script>
    import ComponentWithChildComponent from './component-with-child-component.vue'
    import ComponentWithLifecycleHooks from './component-with-lifecycle-hooks.vue'

    export default{
      name: 'component-with-nested-children',
      components: {
        ChildComponent: ComponentWithChildComponent,
        ComponentWithLifecycleHooks
      }
    }
</script>
