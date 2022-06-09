## O método setMethods

::: warning Aviso de Depreciação
O método `setMethods` está depreciado e será removido nos futuros lançamentos.

Não há um caminho claro para substituir `setMethods`, porque ele depende muito da sua utilização prévia. Ele guia facilmente para testes escamosos que dependem da implementação de detalhes, o que [é desencorajado](https://github.com/vuejs/rfcs/blob/668866fa71d70322f6a7689e88554ab27d349f9c/active-rfcs/0000-vtu-api.md#setmethods).

Nós sugerimos que repense aqueles testes.

Para forjar um método complexo extraia ele do componente e teste ele em quarentena. Para afirmar que um método for chamado, use o seu executor de teste para vigiar ele.
:::

Define os métodos do `vm` do `Wrapper` (envolvedor) e força a atualização.

**Nota que o `Wrapper` deve conter uma instância de Vue.**

- **Argumentos:**

  - `{Object} methods`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const clickMethodStub = sinon.stub()

wrapper.setMethods({ clickMethod: clickMethodStub })
wrapper.find('button').trigger('click')
expect(clickMethodStub.called).toBe(true)
```
