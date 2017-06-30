# isEmpty()

Check if every wrapper in wrapper array contains child nodes. Returns a boolean.

### Returns

(`Boolean`): true if every wrapper in wrapper array does not contain any child nodes. False if it does.

## Example

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.isEmpty()).to.equal(true)
```
