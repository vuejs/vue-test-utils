<template>
    <div>
        <span>
            <component />
        </span>
    </div>
</template>

<script>
    import Component from './component.vue'

    export default{
      name: 'component-with-child',
      components: {
        Component
      }
    }
</script>
