<template>
  <div>
    <input type="checkbox" v-model="checkboxVal">
    <input type="radio" v-model="radioVal" id="radioFoo" value="radioFooResult">
    <input type="radio" v-model="radioVal" id="radioBar" value="radioBarResult">
    <input type="text" v-model="textVal">
    <select v-model="selectVal">
      <option value="selectA"></option>
      <option value="selectB"></option>
      <option value="selectC"></option>
    </select>
    <label id="label-el"></label>

    <span class="checkboxResult" v-if="checkboxVal">checkbox checked</span>
    <span class="counter">{{ counter }}</span>
    {{ textVal }}
    {{ selectVal }}
    {{ radioVal }}
  </div>
</template>

<script>
  export default {
    name: 'component-with-input',
    data () {
      return {
        checkboxVal: undefined,
        textVal: undefined,
        radioVal: undefined,
        selectVal: undefined,
        counter: 0
      }
    },

    watch: {
      checkboxVal () {
        this.counter++
      },
      radioVal () {
        this.counter++
      }
    }
  }
</script>
