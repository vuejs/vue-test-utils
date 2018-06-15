## setValue(value)

テキストボックス `<input>` の値を設定します。

- **引数:**
  - `{String} value`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const input = wrapper.find('input[type="text"]')
input.setValue('some value')
```
