<template>
    <div>
      <ComponentWithInject @injected="handleInject">
      </ComponentWithInject>
    </div>
</template>

<script>
    import ComponentWithInject from './component-with-inject.vue';

    export default {
        name: 'InjectedWrapperComponent',
        components: {
          ComponentWithInject,
        },
        props: {
          handleInject: {
            type: Function,
            required: true,
          }
        },
    };
</script>
