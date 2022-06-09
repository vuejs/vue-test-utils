## O método overview

::: warning Aviso de Depreciação
O método está depreciado e será removido nos futuros lançamentos.
:::

Imprime um simples resumo do `Wrapper` (envolvedor).

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

const wrapper = mount(Component)
wrapper.overview()

// Saída da consola
/*
Wrapper (Visible):

Html:
    <div class="test">
      <p>My name is Tess Ting</p>
    </div>

Data: {
    firstName: Tess,
    lastName: Ting
}

Computed: {
    fullName: Tess Ting'
}

Emitted: {',
    foo: [',
        0: [ hello, world ],
        1: [ bye, world ]'
    ],
    bar: [
        0: [ hey ]'
    ]
}

*/
```
