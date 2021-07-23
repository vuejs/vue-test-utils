## setProps

Défini les props de `Wrapper` `vm` et force la mise à jour de chaque `Wrapper` dans `WrapperArray`.

**Note chaque `Wrapper` doit contenir une instance de Vue.**

- **Arguments:**

      	- `{Object} props`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
barArray.setProps({ foo: 'bar' })
expect(barArray.at(0).vm.foo).toBe('bar')
```
