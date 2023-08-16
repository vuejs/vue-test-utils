## O método setValue

Define o valor de um controle de texo do elemento `input` ou do elemento `select` e atualiza o dado ligado ao `v-model`.

- **Argumentos:**

  - `{any} value`

- **Exemplo:**

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

  // exige o <select multiple>
  const multiselect = wrapper.find('select')
  await multiselect.setValue(['value1', 'value3'])

  const selectedOptions = Array.from(multiselect.element.selectedOptions).map(
    o => o.value
  )
  expect(selectedOptions).toEqual(['value1', 'value3'])
})
```

- **Nota:**

  - O `textInput.setValue(value)` é um apelido do seguinte código.

  ```js
  textInput.element.value = value
  textInput.trigger('input')
  ```

  - O `select.setValue(value)` é um apelido do seguinte código.

  ```js
  select.element.value = value
  select.trigger('change')
  ```
