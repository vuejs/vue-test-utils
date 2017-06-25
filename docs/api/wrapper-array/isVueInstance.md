# isVueInstance()

Check if every wrapper in wrapper array is vue instance. Returns a boolean.

### Returns

(`Boolean`): true if node does is vue instance. False if not.

## Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';
import Bar from './Bar.vue';

const wrapper = mount(Foo);
const barArray = wrapper.findAll(Bar)
expect(barArray.isVueInstance()).to.equal(true)
```
