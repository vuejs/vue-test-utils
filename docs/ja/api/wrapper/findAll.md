# findAll(selector)

[`WrapperArray`](../wrapper-array/README.md)を返します。

有効な[セレクタ](../selectors.md)を使用してください。

- **引数:**
  - `{string|Component} selector`

- **戻り値:** `{WrapperArray}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.findAll('div').at(0)
expect(div.is('div')).toBe(true)
const bar = wrapper.findAll(Bar).at(0)
expect(bar.is(Bar)).toBe(true)
```

- **参照:** [Wrapper](./README.md)
