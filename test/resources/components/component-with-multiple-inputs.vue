<template>
  <div>
    <input
      v-for="index of 5"
      @focus="onFocus(index)"
      :id="index"
      :data-test-position="index"
      :ref="refNameByIndex(index)"
      :key="index"
      type="text"
    />
  </div>
</template>

<script>
export default {
  name: 'component-with-multiple-inputs',
  data: () => ({ activeInputIndex: null }),
  computed: {
    inputRefAtIndex() {
      return index => this.$refs[this.refNameByIndex(index)]
    }
  },

  methods: {
    refNameByIndex(index) {
      return `input${index}`
    },

    returnToLastSelectedInput() {
      return this.focusInput(this.inputRefAtIndex(this.activeInputIndex))
    },

    onFocus(index) {
      const isOdd = Boolean(index % 2)
      if (isOdd) {
        return this.returnToLastSelectedInput()
      }
      this.activeInputIndex = index
    },

    focusInput(inputRef) {
      if (!inputRef) {
        return
      }
      const [input] = inputRef
      input.focus()
    }
  },

  mounted() {
    this.focusInput(this.focusInput(this.inputRefAtIndex(2)))
  }
}
</script>

<style scoped></style>
