## setValue(value)

Устанавливает значение элемента поле ввода текста или выпадающего списка и обновляет связанные данные `v-model`.

- **Аргументы:**

  - `{any} value`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

test('setValue demo', async () => {
  const wrapper = mount(Foo)

  const textInput = wrapper.find('input[type="text"]')
  await textInput.setValue('some value')

  const select = wrapper.find('select')
  await select.setValue('option value')

  // requires <select multiple>
  const multiselect = wrapper.find('select')
  await multiselect.setValue(['value1', 'value3'])
})
```

- **Примечание:**

  - `textInput.setValue(value)` — псевдоним следующего кода.

  ```js
  textInput.element.value = value
  textInput.trigger('input')
  ```

  - `select.setValue(value)` — псевдоним следующего кода.

  ```js
  select.element.value = value
  select.trigger('change')
  ```
