## setValue

设置一个文本控件或 select 元素的值并更新 `v-model` 绑定的数据。

- **参数：**

  - `{String} value`

- **示例：**

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

- **注意：**

  - `textInput.setValue(value)` 是接下来这段代码的别名。

  ```js
  textInput.element.value = value
  textInput.trigger('input')
  ```

  - `select.setValue(value)` 是接下来这段代码的别名。

  ```js
  select.element.value = value
  select.trigger('change')
  ```
