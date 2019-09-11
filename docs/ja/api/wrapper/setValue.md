## setValue(value)

text コントロールの input 要素の 値をセットします。そして、 `v-model` に束縛されているデータを更新します。

- **引数:**

  - `{any} value`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)

const textInput = wrapper.find('input[type="text"]')
textInput.setValue('some value')

const select = wrapper.find('select')
select.setValue('option value')
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
