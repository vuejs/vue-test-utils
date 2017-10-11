# is(selector)

`WrapperArray`の全ての`Wrapper`のDOMノード、もしくは[セレクタ](/docs/ja/api/selectors.md)が`vm`とマッチするか検証します。

- **引数:**
  - `{string|Component} selector`

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.find('div')
expect(divArray.is('div')).to.equal(true)
```