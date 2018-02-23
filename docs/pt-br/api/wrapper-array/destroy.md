# destroy()

Destroí a instância do Vue da cada um dos wrappers do Array.

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)

const divArray = wrapper.findAll('div')
expect(divArray.contains('p')).toBe(true)
divArray.destroy()

expect(divArray.contains('p')).toBe(false)
```
