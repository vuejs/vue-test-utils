<script>
  export default {
    name: 'component-with-slots',
    functional: true,
    render (h, ctx) {
      return h('div', ctx.data, ctx.slots().default)
    }
  }
</script>
