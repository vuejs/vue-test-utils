# name()

Returns component name if node is a Vue component, or the tag name if it is a native DOM node.

### Returns

(`String`): If called on Vue component wrapper, it returns the component name. If node is a native DOM node, it returns the tag name.

## Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = mount(Foo);
expect(wrapper.name()).to.equal('Foo');
```
