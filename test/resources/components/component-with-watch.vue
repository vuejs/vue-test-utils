<template>
    <div>
        {{prop1}}
        {{prop2}}
    </div>
</template>

<script>
    export default {
      props: {
        prop1: { default: 'default prop1' },
        prop2: { default: 'default prop2' }
      },
      watch: {
        prop1 (val) {
          this.prop2 = val
        },
        prop2 () {
          console.info(this.prop1)
        }
      }
    }
</script>
