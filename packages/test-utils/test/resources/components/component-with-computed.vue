<template>
  <div>
    {{reversedMessage}}
  </div>
</template>

<script>
  export default{
    name: 'component-with-child',
    data: () => ({
      message: 'egassem'
    }),
    computed: {
      reversedMessage: function () {
        return this.message.split('').reverse().join('')
      }
    }
  }
</script>
