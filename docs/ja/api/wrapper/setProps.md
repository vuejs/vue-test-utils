# setProps(props)

- **引数:**
  - `{Object} プロパティ(props)`

- **使い方:**

`Wrapper` `vm`のプロパティを設定し更新を強制します。

**WrapperにはVueインスタンスを含む必要があることに注意してください**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.props().foo).to.equal('bar')
```