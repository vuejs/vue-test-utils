## O método name

::: warning Aviso de Depreciação
O método `name` está depreciado e será removido nos futuros lançamentos. Consulte o [vue-test-utils.vuejs.org/upgrading-to-v1/#name](https://vue-test-utils.vuejs.org/upgrading-to-v1/#name).
:::

Retorna o nome do componente se o `Wrapper` (envolvedor) conter uma instância de Vue, ou nome da tag do nó do DOM do `Wrapper` se o `Wrapper` não conter uma instância de Vue.

- **Retorna:** `{string}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.name()).toBe('Foo')
const p = wrapper.find('p')
expect(p.name()).toBe('p')
```
