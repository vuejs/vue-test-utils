## setValue(value)

text コントロールの input 要素の 値をセットします。そして、 `v-model` に束縛されているデータを更新します。

- **引数:**
  - `{any} value`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const input = wrapper.find('input[type="text"]')
input.setValue('some value')
```

- **注:**

`textInput.setValue(value)` は以下のコードのエイリアスです。

```js
textInput.element.value = value
textInput.trigger('input')
```
