## at

Returns `Wrapper` at `index` passed. Uses zero based numbering (i.e. first item is at index 0).

- **Arguments:**

  - `{number} index`

- **Returns:** `{Wrapper}`

- **Example:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
const divArray = wrapper.findAll('div')
const secondDiv = divArray.at(1)
expect(secondDiv.is('p')).toBe(true)
```
