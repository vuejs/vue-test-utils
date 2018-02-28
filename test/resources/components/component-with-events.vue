<template>
  <div>
    <button class="click" @click="clickHandler" id="button" />
    <button class="left-click" @mousedown="mousedownHandler" />
    <div @click="toggleActive" v-bind:class="{ toggle: true, active: isActive }" />
    <input class="keydown" type="text" @keyup="keyupHandler" @keydown="keydownHandler" />
    <input class="keydown-enter" type="text" @keydown.enter="keydownHandler" />
  </div>
</template>

<script>
  export default{
    name: 'component-with-event',
    props: {
      clickHandler: {
        type: Function,
        default: () => {}
      },
      keyupHandler: {
        type: Function,
        default: () => {}
      },
      keydownHandler: {
        type: Function,
        default: () => {}
      }
    },
    data () {
      return {
        isActive: false
      }
    },
    methods: {
      mousedownHandler (event) {
        if (event.button === 0) {
          this.clickHandler()
          console.info(event.defaultPrevented)
        }
      },
      toggleActive () {
        this.isActive = !this.isActive
      }
    }
  }
</script>
