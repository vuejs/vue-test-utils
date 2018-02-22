# find(selector)

最初の DOM ノードの [Wrapper](./README.md)、またはセレクタで一致した Vue コンポーネントを返します。

有効な[セレクタ](../selectors.md)を使用してください。

- **引数:**
  - `{string|Component} selector`

- **戻り値:** `{Wrapper}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.find('div')
expect(div.is('div')).toBe(true)
const bar = wrapper.find(Bar)
expect(bar.is(Bar)).toBe(true)
```

- **参照:** [Wrapper](./README.md)
