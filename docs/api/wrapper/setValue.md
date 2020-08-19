## setValue

Sets value of a text-control input or select element and updates `v-model` bound data.

- **Arguments:**

  - `{any} value`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

test('setValue demo', async () => {
  const wrapper = mount(Foo)

  const textInput = wrapper.find('input[type="text"]')
  await textInput.setValue('some value')

  expect(wrapper.find('input[type="text"]').element.value).toBe('some value')

  const select = wrapper.find('select')
  await select.setValue('option value')

  expect(wrapper.find('select').element.value).toBe('option value')

  // requires <select multiple>
  const multiselect = wrapper.find('select')
  await multiselect.setValue(['value1', 'value3'])

  const selectedOptions = Array.from(multiselect.element.selectedOptions).map(
    o => o.value
  )
  expect(selectedOptions).toEqual(['value1', 'value3'])
})
```

- **Note:**

  - `textInput.setValue(value)` is an alias of the following code.

  ```js
  textInput.element.value = value
  textInput.trigger('input')
  ```

  - `select.setValue(value)` is an alias of the following code.

  ```js
  select.element.value = value
  select.trigger('change')
  ```
