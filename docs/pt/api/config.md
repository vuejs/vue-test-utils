## Configuração

A Vue Test Utils incluem um objeto de configuração para as opções definidas usadas pela Vue Test Utils.

### Opções de Configuração da Vue Test Utils

### `showDeprecationWarnings`

- tipo: `Boolean`
- valor padrão: `true`

Controla se ou não mostrar avisos de depreciação. Quando definida para `true`, todos avisos de depreciação são visíveis na consola.

Exemplo:

```js
import { config } from '@vue/test-utils'

config.showDeprecationWarnings = false
```

### `deprecationWarningHandler`

- tipo: `Function`

Permite controle delicado sobre os avisos de depreciação. Quando `showDeprecationWarnings` é definido para `true`, todos avisos de depreciação serão passados para este manipulador com o nome do método como primeiro argumento e a mensagem original como segundo argumento.

::: tip
Isto poderia ser útil para registar mensagens de depreciação para separar a localização ou ajudar numa atualização gradual de base de código para última versão do utilitários de teste pela ignorância de certas funções de avisos depreciadas
:::

Exemplo:

```js
import { config } from '@vue/test-utils'

config.showDeprecationWarnings = true
config.deprecationWarningHandler = (method, message) => {
  if (method === 'emittedByOrder') return

  console.error(message)
}
```

### `stubs`

- tipo: `{ [name: string]: Component | boolean | string }`
- valor padrão: `{}`

O forjado guardado dentro de `config.stubs` é usado por padrão.
Forjados para usar dentro de componentes. Estes são sobrescritos pelo `stubs` passado dentro das opções em montagem.

Quando estiver passando `stubs` como um arranjo dentro de opções em montagem, os `config.stubs` são convertidos para um arranjo, e forjarão componentes com um componente básico que retornam `<${component name}-stub>`.

Exemplo:

```js
import { config } from '@vue/test-utils'

config.stubs['my-component'] = '<div />'
```

### `mocks`

- tipo: `Object`
- valor padrão: `{}`

Tal como nos `stubs`, os valores passados para o `config.mocks` são usados por padrão. Quaisquer valores passados para as opções de montagem do objeto `mocks` terão prioridade sobre aqueles declarados dentro de `config.mocks`.

Exemplo:

```js
import { config } from '@vue/test-utils'

config.mocks['$store'] = {
  state: {
    id: 1
  }
}
```

### `methods`

- tipo: `{ [name: string]: Function }`
- valor padrão: `{}`

Você pode configurar métodos padrão usando o objeto `config`. Isto podem ser útil para plugins que injetam métodos aos componentes, tal como o [VeeValidate](https://logaretm.github.io/vee-validate/). Você pode sobrescrever métodos definidos dentro de `config` ao passar os `methods` dentro das opções em montagem.

Exemplo:

```js
import { config } from '@vue/test-utils'

config.methods['getData'] = () => {}
```

### `provide`

- tipo: `Object`
- valor padrão: `{}`

Tal como em `stubs` ou `mocks`, os valores passados para o `config.provide` são usados por padrão. Quaisquer valores passados para opções em montagem do objeto `provide` terão prioridade sobre aqueles declarados dentro de `config.provide`. **Por favor repare que isto não é suportado para passar uma função como `config.provide`.**

Exemplo:

```js
import { config } from '@vue/test-utils'

config.provide['$logger'] = {
  log: (...args) => {
    console.log(...args)
  }
}
```
