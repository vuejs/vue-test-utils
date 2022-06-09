## O método is

::: warning Aviso de Depreciação
O uso do método `is` para afirmar que o envolvedor corresponde ao seletor de DOM está depreciado e será removido.

Para tal caso de uso considere um correspondente personalizado tal como aqueles fornecidos no [jest-dom](https://github.com/testing-library/jest-dom#custom-matchers).
ou ao invés disso use [`Element.tagName`](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName) nativo para afirmação do tipo elemento de DOM.

Para manter estes testes, uma substituição válida para:

- `is('DOM_SELECTOR')` é uma afirmação de `wrapper.element.tagName`.
- `is('ATTR_NAME')` é uma afirmação de veracidade de `wrapper.attributes('ATTR_NAME')`.
- `is('CLASS_NAME')` é uma afirmação de veracidade de `wrapper.classes('CLASS_NAME')`.

Afirmação contra definição do componente não está depreciada

Quando estiver usando com o `findComponent`, acesse o elemento do DOM com `findComponent(Comp).element`
:::

Afirma que o nó do DOM do `Wrapper` (envolvedor) ou `vm` (modelo de vue) corresponde ao [seletor](../selectors.md).

- **Argumentos:**

  - `{string|Component} selector`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.is('div')).toBe(true)
```
