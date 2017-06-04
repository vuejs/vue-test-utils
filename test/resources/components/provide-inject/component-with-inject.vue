<template>
    <div />
</template>

<script>
    export default {
        name: 'InjectComponent',
        inject: ['fromMount'],
        created() {
            this.$emit('injected', this.fromMount);
        },
    };
</script>
