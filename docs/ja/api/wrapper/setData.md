## setData(data)

`Wrapper` `vm` データを設定します。

setData は再帰的に Vue.set を実行することで動作します。

**Wrapper には Vue インスタンスを含む必要があることに注意してください**

- **引数:**

  - `{Object} data`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setData({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```
