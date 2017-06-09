# hasProp(prop, value)

Check if wrapper DOM node has a class name. Returns a boolean. 

Can only be called on a Vue instance.

### Arguments

`prop` (`String`): prop name to assert value of.

`value` (`String`): the value prop should hold.

### Returns

(`Boolean`): `true` if instance has prop. `false` if not.

## Example

```js
import { shallow } from 'vue-test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
expect(wrapper.hasProp('bar', 10)).to.equal(true)
```
