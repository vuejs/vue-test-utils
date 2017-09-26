# at(index)

- **Usage:**

Returns `Wrapper` at `index` passed. Uses zero based numbering (i.e. first item is at index 0).

- **Arguments:**
  - `{number} index`

- **Returns:** `{Wrapper}`

- **Example:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')
const secondDiv = divArray.at(1)
expect(secondDiv.is('p')).to.equal(true)
```