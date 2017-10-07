# setMethods(methods)

- **引数:**
  - `{Object} methods`

- **使い方:**

`Wrapper``vm`メソッドを設定し、更新を強制します。

**WrapperにはVueインスタンスを含む必要があることに注意してください**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const clickMethodStub = sinon.stub()

wrapper.setMethods({ clickMethod: clickMethodStub })
wrapper.find('button').trigger('click')
expect(clickMethodStub.called).to.equal(true)
```
