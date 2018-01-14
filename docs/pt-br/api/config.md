# Configurações

O vue-test-utils apresenta um objeto de configuração para que você possa definir as opções usadas no wrapper.

## Opções de configurações do `vue-test-utils

### Esboços

- tipo: `Object`
- padrão: `{
  transition: TransitionStub,
  'transition-group': TransitionGroupStub
}`

Esboços são usados em todos componentes. Eles são substituídos pelos esboços passados nas opções da montagem.

Quando você passa os esboços como um Array de String nas opções de montagens, o `config.stubs` é convertido em um Array e os componentes são esboçados com um componente que retorna uma div.

Exemplo:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs['meu-componente'] = '<div />'
```
