# setData(data)

- **引数:**
  - `{Object} データ(data)`

- **使い方:**

`Wrapper` `vm` データを設定し、更新を強制します。

**WrapperにはVueインスタンスを含む必要があることに注意してください**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setData({ foo: 'bar' })
expect(wrapper.vm.foo).to.equal('bar')
```
