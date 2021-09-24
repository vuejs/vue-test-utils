## findComponent

Retourne le `wrapper` du premier composant Vue correspondant.

- **Arguments:**

  - `{Component|ref|name} selector`

- **Retours:** `{Wrapper}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const bar = wrapper.findComponent(Bar) // => trouve Bar par instance de composant
expect(bar.exists()).toBe(true)
const barByName = wrapper.findComponent({ name: 'bar' }) // => trouve Bar par `name`
expect(barByName.exists()).toBe(true)
const barRef = wrapper.findComponent({ ref: 'bar' }) // => trouve Bar par `ref`
expect(barRef.exists()).toBe(true)
```
