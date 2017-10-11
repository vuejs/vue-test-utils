# findAll(selector)

[Wrappers](/docs/ja/api/wrapper/README.md) の[`WrapperArray`](/docs/ja/api/wrapper-array/README.md)を返します。

有効な[selector](/docs/ja/api/selectors.md)を使用してください。

- **引数:**
  - `{string|Component} selector`

- **戻り値:** `{WrapperArray}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.findAll('div').at(0)
expect(div.is('div')).to.equal(true)
const bar = wrapper.findAll(Bar).at(0)
expect(bar.is(Bar)).to.equal(true)
```

- **参照:** [Wrapper](/docs/ja/api/wrapper/README.md)