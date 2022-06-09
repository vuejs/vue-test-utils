## O método isVisible

Afirma que o `Wrapper` está visível.

Retorna `false` se um elemento ancestral que tem o estilo `display: none`, `visibility: hidden`, `opacity: 0` está localizado dentro de uma tag `<details>` colapsada ou tem um atributo `hidden`.

Isto pode ser usado para afirmar que um componente está escondido por `v-show`.

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.find('.is-not-visible').isVisible()).toBe(false)
```
