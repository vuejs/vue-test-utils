# isEmpty()

Check if wrapper contains child nodes. Returns a boolean.

### Returns

(`Boolean`): true if node does not contain any child nodes. False if it does.

## Example

```js
import { shallow } from 'vue-test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
expect(wrapper.isEmpty()).to.equal(true)
```
