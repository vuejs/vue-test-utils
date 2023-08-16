## O método findAllComponents

Retorna um [`WrapperArray`](../wrapper-array/) de todos componentes de Vue correspondentes.

- **Argumentos:**

  - O `selector` usa qualquer [seletor](../selectors.md) válido

- **Retorna:** `{WrapperArray}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const bar = wrapper.findAllComponents(Bar).at(0)
expect(bar.exists()).toBeTruthy()
const bars = wrapper.findAllComponents(Bar)
expect(bars).toHaveLength(1)
```

::: warning Uso com seletores de CSS
Ao usar o `findAllComponents` com o seletor de CSS está sujeito as mesmas limitações do [findComponent](api/wrapper/findComponent.md)
:::
