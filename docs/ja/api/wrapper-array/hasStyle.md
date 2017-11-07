# hasStyle(style, value)

`WrapperArray` の全ての `Wrapper` の DOM ノードが style 属性とマッチする値を持っているか検証します。

`Wrapper` DOM ノードが `value` にマッチする `style` 値がある場合 `true` を返します。 

**`jsdom`で実行しているときにのみインラインスタイルを検出しますので注意してください。**
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
const divArray = wrapper.findAll('div')
expect(divArray.hasStyle('color', 'red')).toBe(true)
```
