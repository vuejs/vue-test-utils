# find(selector)

Retorna um wrapper [`Wrapper`](README.md) com o primeiro elmento do DOM ou o componente Vue encontrado a partir do seletor

Use qualquer [seletor](../selectors.md) válido.

- **Argumentos:**
  - `{String|Component} selector`

- **Retorna:** `{Wrapper}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const div = wrapper.find('div')
expect(div.is('div')).toBe(true)

const bar = wrapper.find(Bar)
expect(bar.is(Bar)).toBe(true)
```

- **Veja também:** [Wrapper](README.md)
