<template>
  <div class="container" @keydown="change">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script>
  export default {
    name: 'component-with-slots',
    data () {
      return {
        'foo': 'bar'
      }
    },
    methods: {
      change () {
        this.foo = 'BAR'
      }
    }
  }
</script>
