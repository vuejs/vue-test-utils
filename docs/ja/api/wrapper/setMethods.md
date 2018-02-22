# setMethods(methods)

`Wrapper` `vm` メソッドを設定し、更新を強制します。

**Wrapper には Vue インスタンスを含む必要があることに注意してください**

- **引数:**
  - `{Object} methods`

- **例:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const clickMethodStub = sinon.stub()

wrapper.setMethods({ clickMethod: clickMethodStub })
wrapper.find('button').trigger('click')
expect(clickMethodStub.called).toBe(true)
```
