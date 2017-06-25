# isVueInstance()

Check if wrapper is vue instance. Returns a boolean.

### Returns

(`Boolean`): true if node does is vue instance. False if not.

## Example

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).to.equal(true)
```
