# contains(selector)

`WrapperArray` のすべての Wrapper にセレクタが含まれているか検証します。

有効な[セレクタ](../selectors.md)を使用してください。

- **引数:**
  - `{string|Component} selector`

- **戻り値:** `{boolean}`

- **例:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.contains('p')).toBe(true)
expect(divArray.contains(Bar)).toBe(true)
```
