<template>
  <div>
    <a-component />
  </div>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'
import AComponent from './component.vue'

@Component({
  components: {
    AComponent
  }
})
export default class CogPage extends Vue {}
</script>
