# contains(selector)

- **引数:**
  - `{string|Component} selector`

- **戻り値:** `{boolean}`

- **使い方:**

`WrapperArray`のすべてのWrapperにセレクターが含まれているかアサートします。

有効な[セレクタ](/docs/ja/api/selectors.md)を使用してください。

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.contains('p')).to.equal(true)
expect(divArray.contains(Bar)).to.equal(true)
```
