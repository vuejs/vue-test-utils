# TransitionGroupStub (Esboço de grupo de transições)

É um componente para substituir o componente `transition-group`. Em vez de executar as transições do grupo de forma assíncrona, ele retorna os componentes filhos de forma síncrona.

Por padrão é configurado para trocar todos os componentes `transitions-group` da sua aplicação. Para desativar o componente `transition-group`, passe `config.stubs['transition-group']` para false:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs['transition-group'] = false
```

Para redefinir os grupos de transições no esboço, use:

```js
import VueTestUtils, { TransitionGroupStub } from '@vue/test-utils'

VueTestUtils.config.stubs['transition-group'] = TransitionGroupStub
```

Para configura-lo na montagem, use:

```js
import { mount, TransitionGroupStub } from '@vue/test-utils'

mount(Component, {
  stubs: {
    'transition-group': TransitionGroupStub
  }
})
```
