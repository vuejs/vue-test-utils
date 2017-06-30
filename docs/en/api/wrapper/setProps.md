# setProps(data)

Sets Vue instance props and forces update. Can only be called on a Vue component wrapper

### Arguments

props (`Object`): Props properties and corresponding value to set

### Example

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.props().foo).to.equal('bar')
```
