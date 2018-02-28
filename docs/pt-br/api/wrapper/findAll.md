# findAll(selector)

Retorna um [`WrapperArray`](../wrapper-array/README.md) de [Wrappers](README.md).

Use qualquer [seletor](../selectors.md) válido.

- **Argumentos:**
  - `{String|Component} selector`

- **Retorna:** `{WrapperArray}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const div = wrapper.findAll('div').at(0)
expect(div.is('div')).toBe(true)

const bar = wrapper.findAll(Bar).at(0)
expect(bar.is(Bar)).toBe(true)
```

- **Veja também:** [Wrapper](README.md)
