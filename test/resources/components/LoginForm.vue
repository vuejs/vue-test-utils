<template>
  <Form>
    <template v-slot="{ username }">
      <FormError :show="username" />
    </template>
  </Form>
</template>

<script>
import Form from './Form.vue'

export const FormError = {
  props: ['show'],
  render(h) {
    return h('div', 'Form Error')
  }
}

export default {
  components: {
    Form,
    FormError
  }
}
</script>
