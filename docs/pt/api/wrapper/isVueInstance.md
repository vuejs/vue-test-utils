## O método isVueInstance

::: warning Aviso de Depreciação
O método `isVueInstance` está depreciado e será removido nos futuros lançamentos.

Testes que dependem da afirmação do método `isVueInstance` fornecem pouco ou nenhum valor. Nós sugerimos substituir eles por afirmações resolutas.

Para manter esses testes, uma substituição válida para o método `isVueInstance()` é uma afirmação de veracidade (truthy) do `wrapper.find(...).vm`.
:::

Afirma que o `Wrapper` é uma instância de Vue.

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).toBe(true)
```
