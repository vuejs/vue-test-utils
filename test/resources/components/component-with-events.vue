<template>
    <div>
        <button class="click" @click="clickHandler" id="button" />
        <input class="keydown" type="text" @keydown="keydownHandler" />
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
        keydownHandler: {
          type: Function,
          default: () => {}
        }
      }
    }
</script>
