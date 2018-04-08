<template>
  <div>
    <div id="foo">
      <slot name="foo"
            v-for="(item, index) in foo"
            :text="item.text"
            :index="index">
      </slot>
    </div>
    <div id="bar">
      <slot name="bar"
            v-for="(item, index) in bar"
            :text="item.text"
            :index="index">
      </slot>
    </div>
    <div id="slots">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'component-with-scoped-slots',
    data () {
      return {
        foo: [{ text: 'a1' }, { text: 'a2' }, { text: 'a3' }],
        bar: [{ text: 'A1' }, { text: 'A2' }, { text: 'A3' }]
      }
    }
  }
</script>
