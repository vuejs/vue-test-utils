<template>
  <div>
    <div id="destructuring">
      <slot name="destructuring"
            v-for="(item, index) in items"
            :item="item"
            :index="index">
      </slot>
    </div>
    <div id="list">
      <slot name="list"
            v-for="(item, index) in foo"
            :text="item.text"
            :index="index">
      </slot>
    </div>
    <div id="single">
      <slot name="single" :text="bar"></slot>
    </div>
    <div id="noProps">
      <slot name="noProps"></slot>
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
        items: ['1', '2', '3'],
        foo: [{ text: 'a1' }, { text: 'a2' }, { text: 'a3' }],
        bar: 'abc'
      }
    }
  }
</script>
