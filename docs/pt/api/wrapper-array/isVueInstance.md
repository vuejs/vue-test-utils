## O método isVueInstance

::: warning Aviso de Depreciação
O método `isVueInstance` está depreciado e será removido nos futuros lançamentos.

Testes que dependem da afirmação do método `isVueInstance` fornecem pouco ou nenhum valor. Nós sugerimos substituir eles por afirmações resolutas.

Para manter esses testes, uma substituição válida para o método `isVueInstance()` é uma afirmação de veracidade (truthy) do `wrapper.find(...).vm`.
:::

Afirma que todo `Wrapper` (envolvedor) dentro do `WrapperArray` é uma instância de Vue.

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.isVueInstance()).toBe(true)
```
