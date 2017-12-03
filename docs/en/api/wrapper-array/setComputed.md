
# setComputed(computedObjects)

Sets `Wrapper` `vm` computed and forces update on each `Wrapper` in `WrapperArray`.

**Note every `Wrapper` must contain a Vue instance.**
**Note every Vue instance must already have the computed properties passed to `setComputed`.**

- **Arguments:**
  - `{Object} computed properties`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)

barArray.setComputed({
  computed1: 'new-computed1',
  computed2: 'new-computed2'
})
```
