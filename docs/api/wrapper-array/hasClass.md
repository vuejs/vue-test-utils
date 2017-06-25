# hasClass(className)

Check if every wrapper vnode in wrapper array has a class name containing `className`. Returns a boolean.

### Arguments

`className` (`String`): class name to assert vnode contains.

### Returns

(`Boolean`): `true` if every wrapper vnode contains class. `false` otherwise.

## Example

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasClass('bar')).to.equal(true)
```
