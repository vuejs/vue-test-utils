# contains(selector)

- **Arguments:**
  - `{string|Component} selector`

- **Returns:** `{boolean}`

- **Usage:**

Assert every wrapper in `WrapperArray` contains selector. 

Use any valid [selector](/api/selectors.md).

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
