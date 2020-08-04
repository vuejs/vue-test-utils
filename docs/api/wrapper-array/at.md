## at

Returns `Wrapper` at `index` passed. Uses zero based numbering (i.e. first item is at index 0).
If `index` is negative, indexing starts from the last element (i.e. last item is at index -1).
When none is found, returns an `ErrorWrapper`.

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
expect(secondDiv.is('div')).toBe(true)

const lastDiv = divArray.at(-1)
expect(lastDiv.is('div')).toBe(true)

const nonExistentDiv = divArray.at(1000)
expect(nonExistentDiv.exists()).toBe(false)
```
