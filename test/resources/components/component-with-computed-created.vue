<script>
  export default {
    name: 'my-component',
    props: ['prop1'],
    computed: {
      prop2 () {
        return this.prop1
      }
    },
    created () {
      this.prop2
    }
  }
</script>

