# hasAttribute(attribute, value)

Check if wrapper DOM node has attribute matching value

### Arguments

`attribute` (`String`): attribute name to assert value of.

`value` (`String`): the value attribute should hold.

### Returns

(`Boolean`): `true` if element contains attribute with matching value, `false` otherwise.

## Example

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasAttribute('id', 'foo')).to.equal(true)
```
