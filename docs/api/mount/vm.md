# vm

Every Vue component wrapper has a vm property, which is the Vue instance.

### Example

```js
import { mount } from 'avoriaz';
import Foo from './Foo.vue';

const wrapper = mount(Foo);
expect(wrapper.vm.bar).to.equal('bar');
wrapper.vm.bar = 'new value';
expect(wrapper.vm.bar).to.equal('new value');
```
