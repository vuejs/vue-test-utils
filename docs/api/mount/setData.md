# setData(data)

Sets Vue instance data and forces update. Can only be called on a Vue component wrapper

### Arguments

data (`Object`): Data properties and corresponding value to set

### Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = mount(Foo);
wrapper.setData({foo: 'bar'});
expect(wrapper.data().foo).to.equal('bar');
```
