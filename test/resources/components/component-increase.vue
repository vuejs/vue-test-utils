<template>
  <div>
    <button class="click" @click="clickHandler" id="button" />
  </div>
</template>

<script>
  export default{
    name: 'component-increase',
    data () {
      return {
        count: 0
      }
    },
    methods: {
      clickHandler (event) {
        this.count += 1
      }
    }
  }
</script>
