# hasAttribute(attribute, value)

Verifica se o wrapper contém o atributo mencionado no seu elemento do DOM.

Retorna `true` se o wrapper contém o atributo.

- **Argumentos:**
  - `{String} attribute`
  - `{String} value`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

// Exemplo <div class="foo">...</div>
const wrapper = mount(Foo)
expect(wrapper.hasAttribute('id', 'foo')).toBe(true)
```

- **Alternativa:**

Você poderia obter o atributo do `Wrapper.element` para então verificar baseado no valor retornado:

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.element.getAttribute('id')).toBe('foo')
```

Isso faz com que o erro da asserção sejá mais informativo.
