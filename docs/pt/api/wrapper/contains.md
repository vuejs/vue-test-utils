## O método contains

::: warning Deprecation warning
O uso de `contains` está depreciado e será removido nos futuros lançamentos. Use o [`find`](./find.md) para nós (nodes) do DOM (usando a sintaxe do `querySelector`), o [`findComponent`](./findComponent.md) para componentes, ou antes o [`wrapper.get`](./get.md).
:::

Afirma que `Wrapper` contém um elemento ou componente que corresponde ao [seletor](../selectors.md).

- **Argumentos:**

  - `{string|Component} selector`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
expect(wrapper.contains('p')).toBe(true)
expect(wrapper.contains(Bar)).toBe(true)
```

- **Consulte também:** [seletores](../selectors.md)
