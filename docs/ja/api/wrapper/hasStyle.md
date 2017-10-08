# hasStyle(style, value)

`Wrapper`DOMノードにstyle属性と値があることを検証します。

`Wrapper`DOMノードにstyle属性と一致した文字列があればtrueを返します。

**`jsdom`で実行しているときのみ、インラインスタイルを検出します。**

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
expect(wrapper.hasStyle('color', 'red')).to.equal(true)
```