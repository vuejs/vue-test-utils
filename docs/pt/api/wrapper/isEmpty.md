## O método isEmpty

::: warning Aviso de Depreciação
O método `isEmpty` está depreciado e será removido nos futuros lançamentos.

Considere um correspondente personalizado tais como aqueles fornecidos pelo [jest-dom](https://github.com/testing-library/jest-dom#tobeempty).

Quando estiver usando o `findComponent`, acesse o elemento do DOM com o `findComponent(Comp).elment`
:::

Afiram que o `Wrapper` (envolvedor) não contém nó filho.

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isEmpty()).toBe(true)
```
