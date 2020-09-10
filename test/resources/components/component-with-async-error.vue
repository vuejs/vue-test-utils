<template>
  <div />
</template>

<script>
export default {
  async beforeMount() {
    await new Promise(resolve => resolve())
    throw new Error()
  }
}
</script>
