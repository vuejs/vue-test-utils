## findAllComponents

Retourne un [`WrapperArray`](../wrapper-array/) de tous les composants Vue correspondants.

- **Arguments:**

  - `{Component|ref|name} selector`

- **Retours:** `{WrapperArray}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const bar = wrapper.findAllComponents(Bar).at(0)
expect(bar.exists()).toBeTruthy()
const bars = wrapper.findAllComponents(Bar)
expect(bar).toHaveLength(1)
```
