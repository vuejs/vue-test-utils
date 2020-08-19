## setValue(value)

text コントロールの input 要素の 値をセットします。そして、 `v-model` に束縛されているデータを更新します。

- **引数:**

  - `{any} value`

- **例:**

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

- **注:**

  - `textInput.setValue(value)` は以下のコードのエイリアスです。

  ```js
  textInput.element.value = value
  textInput.trigger('input')
  ```

  - `select.setValue(value)` は以下のコードのエイリアスです。

  ```js
  select.element.value = value
  select.trigger('change')
  ```
