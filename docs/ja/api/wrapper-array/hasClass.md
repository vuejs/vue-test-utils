# hasClass(className)

`WrapperArray`のすべての`Wrapper`にDOMノードが`className`を含むクラスを持っているか検証します。

- **引数:**
  - `{string} className`

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasClass('bar')).to.equal(true)
```
