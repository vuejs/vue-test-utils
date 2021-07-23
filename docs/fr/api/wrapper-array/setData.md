## setData

Défini les données `Wrapper` `vm` sur chaque `Wrapper` dans `WrapperArray`.

**Note chaque `Wrapper` doit contenir une instance de Vue.**

- **Arguments:**

  - `{Object} data`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
barArray.setData({ foo: 'bar' })
expect(barArray.at(0).vm.foo).toBe('bar')
```
