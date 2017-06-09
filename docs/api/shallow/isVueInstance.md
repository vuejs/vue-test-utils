# isVueInstance()

Check if wrapper is vue instance. Returns a boolean.

### Returns

(`Boolean`): true if node does is vue instance. False if not.

## Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = shallow(Foo);
expect(wrapper.isVueInstance()).to.equal(true);
```
