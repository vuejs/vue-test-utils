## O método contains

Afirma que todo wrapper (envolvedor) dentro do `WrapperArray` contém o seletor.

Use qualquer [seletor](../selectors.md) válido.

- **Argumentos:**

  - `{string|Component} selector`

- **Returna:** `{boolean}`

- **Exemplo:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallowMount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.contains('p')).toBe(true)
expect(divArray.contains(Bar)).toBe(true)
```
