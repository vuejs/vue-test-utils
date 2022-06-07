## O método isVisible

Afirma que todo `Wrapper` (envolvedor) dentro do `WrapperArray` está visível.

Retorna `false` se pelo menos elemento ancestral tiver o estilo `display: none`, `visibility: hidden`, `opacity: 0`, estiver localizado dentro tag `<details>` colapsada ou tiver o atributo `hidden`.

Isto pode ser usado para afirmar que o componente está oculto pelo `v-show`.

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.findAll('.is-not-visible').isVisible()).toBe(false)
expect(wrapper.findAll('.is-visible').isVisible()).toBe(true)
```
