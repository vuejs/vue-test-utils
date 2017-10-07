# hasStyle(style, value)

- **引数:**
  - `{string} style`
  - `{string} value`

- **戻り値:** `{boolean}`

- **使い方:**

`WrapperArray`の全ての`Wrapper`のDOMノードにstyle属性とマッチする値を持っているかアサートします。

Returns `true` if `Wrapper` DOM node has `style` matching `string`.

**`jsdom`で実行しているときにのみインラインスタイルを検出しますので注意してください。**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasStyle('color', 'red')).to.equal(true)
```
