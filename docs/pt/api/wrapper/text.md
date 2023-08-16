## O método text

Retorna o conteúdo do texto do `Wrapper` (envolvedor).

- **Retorna:** `{string}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.text()).toBe('bar')
```
