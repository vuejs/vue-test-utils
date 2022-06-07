## O método isEmpty

::: warning Aviso de Depreciação
O `isEmpty` está depreciado e será removido nos futuros lançamentos.

Considere um correspondente personalizado tais como aqueles fornecidos dentro do [jest-dom](https://github.com/testing-library/jest-dom#tobeempty).

Sempre que estiver usando com `findComponent` acesse o elemento do DOM com `findComponent(Comp).element`
:::

Afirma que todo `Wrapper` dentro do `WrapperArray` não contém nó filho.

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.isEmpty()).toBe(true)
```
