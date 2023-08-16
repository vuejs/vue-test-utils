## O método find

::: warning Aviso de Depreciação
O uso do `find` para procurar por um componente está depreciado e será removido. Ao invés disso use o [`findComponent`](./findComponent.md).
O método `find` continuará a funcionar para achar elementos usando qualquer [seletor](../selectors.md) válido.
:::

Retorna o `Wrapper` (envolvedor) do primeiro nó do DOM ou componente do Vue que corresponde ao seletor.

Use qualquer seletor de DOM válido (usa a sintaxe de `querySelector`).

- **Argumentos:**

  - `{string} selector`

- **Retorna:** `{Wrapper}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const div = wrapper.find('div')
expect(div.exists()).toBe(true)

const byId = wrapper.find('#bar')
expect(byId.element.id).toBe('bar')
```

- **Nota:**

  - Você pode encadear juntas chamadas de `find`:

```js
const button = wrapper.find({ ref: 'testButton' })
expect(button.find('.icon').exists()).toBe(true)
```

Consulte também: o [get](./get.md).
