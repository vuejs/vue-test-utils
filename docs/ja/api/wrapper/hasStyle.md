# hasStyle(style, value)

`Wrapper` DOM ノードが値に一致するにスタイルを持つか検証します。

`Wrapper` DOM ノードが `string` に一致する `stuyle` を持つ場合は、`true` を返します。

**`jsdom` で実行しているときのみ、インラインスタイルを検出します。**

- **引数:**
  - `{string} style`
  - `{string} value`

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasStyle('color', 'red')).toBe(true)
```
