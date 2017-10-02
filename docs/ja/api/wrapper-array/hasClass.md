# hasClass(className)

- **引数:**
  - `{string} クラス名(className)`

- **戻り値:** `{boolean}`

- **使い方:**

`WrapperArray`のすべての`Wrapper`にDOMノードが`className`を含むクラスを持っているかアサートします。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasClass('bar')).to.equal(true)
```
