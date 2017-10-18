# contains(selector)

Assert every wrapper in `WrapperArray` contains selector.

Use any valid [selector](../selectors.md).

- **Arguments:**
  - `{string|Component} selector`

- **Returns:** `{boolean}`

- **Example:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.contains('p')).toBe(true)
expect(divArray.contains(Bar)).toBe(true)
```
