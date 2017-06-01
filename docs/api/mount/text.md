# text()

Returns text content of wrapper.

### Returns

(`String`): text content of wrapper.

### Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = mount(Foo);
expect(wrapper.text()).to.equal('bar');
```
