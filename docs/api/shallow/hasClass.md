# hasClass(className)

Check if wrapper DOM node has a class name. Returns a boolean.

### Arguments

`className` (`String`): class name to assert element contains.

### Returns

(`Boolean`): `true` if element contains class. `false` otherwise.

## Example

```js
import { shallow } from 'vue-test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
expect(wrapper.hasClass('bar')).to.equal(true)
```
