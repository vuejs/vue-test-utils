<template>
    <div>
        <span>
            <child-component />
        </span>
    </div>
</template>

<script>
    import ComponentWithChildComponent from './component-with-child-component.vue'

    export default{
      name: 'component-with-nested-children',
      components: {
        ChildComponent: ComponentWithChildComponent
      }
    }
</script>
