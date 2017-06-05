<template>
    <div>
      {{ fromMount }}
    </div>
</template>

<script>
    export default {
        name: 'component-with-inject',
        inject: ['fromMount'],
        beforeCreate() {
          this.setByOriginalBeforeCreate = 'created'
        }
    };
</script>
