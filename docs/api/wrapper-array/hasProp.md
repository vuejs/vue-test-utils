# hasProp(prop, value)

Check if every wrapper vm in wrapper array has prop matching value 

Can only be called on a Vue instance.

### Arguments

`prop` (`String`): prop name to assert value of.

`value` (`String`): the value prop should hold.

### Returns

(`Boolean`): `true` if instance has prop. `false` if not.

## Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = mount(Foo);
const barArray = wrapper.findAll(Bar)
expect(barArray.hasProp('bar', 10)).to.equal(true);
```
