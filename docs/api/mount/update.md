# update()

Force root Vue component to re-render. If called on a Vue component wrapper, it will force the Vue component to re-render.

### Example

```js
import Foo from './Foo.vue';

const wrapper = mount(Foo);
expect(wrapper.vm.bar).to.equal('bar');
wrapper.vm.bar = 'new value';
wrapper.update();
expect(wrapper.vm.bar).to.equal('new value');
```