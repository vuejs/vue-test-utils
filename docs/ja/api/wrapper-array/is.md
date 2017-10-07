# is(selector)

- **引数:**
  - `{string|Component} selector`

- **戻り値:** `{boolean}`

- **使い方:**

`WrapperArray`の全ての`Wrapper`のDOMノード、もしくは[セレクタ](/docs/ja/api/selectors.md)が`vm`とマッチするかアサートします。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.find('div')
expect(divArray.is('div')).to.equal(true)
```