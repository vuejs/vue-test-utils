# hasAttribute(attribute, value)

Check if every wrapper vnode in wrapper array has attribute matching value

### Arguments

`attribute` (`String`): attribute name to assert value of.

`value` (`String`): the value attribute should hold.

### Returns

(`Boolean`): `true` if every wrapper vnode contains attribute with matching value, `false` otherwise.

## Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = mount(Foo);
const divArray = wrapper.findAll('div')
expect(divArray.hasAttribute('id', 'foo')).to.equal(true);
```
