# setProps(props)

`Wrapper` `vm` プロパティを設定し更新を強制します。

**Wrapper には Vue インスタンスを含む必要があることに注意してください**

- **引数:**
  - `{Object} props`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.props().foo).toBe('bar')
```
