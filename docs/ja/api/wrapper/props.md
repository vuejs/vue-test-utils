# props()

`Wrapper` の `vm` プロパティの props オブジェクトを返します。

**Wrapper には Vue インスタンスを含む必要があることに注意してください**

- **戻り値:** `{[prop: string]: any}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    bar: 'baz'
  }
})
expect(wrapper.props().bar).toBe('baz')
```
