# TransitionStub (esboço de transição)

É um componente para substituir o componente `transition`. Em vez de executar as transições de forma assíncrona, ele retorna o componente filho de forma síncrona.

Por padrão é configurado para trocar todos os componentes `transitions` da sua aplicação. Para desativar o componente `transition`, passe `config.stubs.transition` para false:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs.transition = false
```

Para redefini-lo como componente de transição, use:

```js
import VueTestUtils, { TransitionStub } from '@vue/test-utils'

VueTestUtils.config.stubs.transition = TransitionStub
```

Para configura-lo como um esboço nas opções de montagem, use:

```js
import { mount, TransitionStub } from '@vue/test-utils'

mount(Component, {
  stubs: {
    transition: TransitionStub
  }
})
```
