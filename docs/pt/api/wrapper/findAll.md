## O método findAll

::: warning Aviso de Depreciação
O uso de `findAll` para pesquisar por componentes está depreciado e será removido. Ao invés disso use `findAllComponents`.
O método `findAll` continuará a funcionar para achar elementos usando qualquer [seletor](../selectors.md) válido.
:::

Retorna um [`WrapperArray`](../wrapper-array/).

Usa qualquer [seletor](../selectors.md) válido.

- **Argumentos:**

  - `{string|Component} selector`

- **Retorna:** `{WrapperArray}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const div = wrapper.findAll('div').at(0)
expect(div.is('div')).toBe(true)

const bar = wrapper.findAll(Bar).at(0) // Uso depreciado
expect(bar.is(Bar)).toBe(true)
```
