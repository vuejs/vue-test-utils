# hasStyle(style, value)

- **引数:**
  - `{string} style属性(style)`
  - `{string} 値(value)`

- **戻り値:** `{boolean}`

- **使い方:**

`Wrapper`DOMノードにstyle属性と値があることをアサートします。

`Wrapper`DOMノードにstyle属性と一致した文字列があればtrueを返します。
**`jsdom`で実行しているときのみ、インラインスタイルを検出します。**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasStyle('color', 'red')).to.equal(true)
```