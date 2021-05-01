## Config

Vue Test Utils comprend un objet de configuration des options définies utilisées par Vue Test Utils.

### Vue Test Utils Config Options

### `showDeprecationWarnings`

- type: `Boolean`
- default: `true`

Contrôler s'il faut ou non afficher des avertissements de dépréciation . Lorsqu'il est sur `true`, tous les avertissements de déprédation sont visibles dans la console.

Exemple:

```js
import { config } from '@vue/test-utils'

config.showDeprecationWarnings = false
```

### `deprecationWarningHandler`

- type: `Function`

Permet un contrôle fin des avertissements de dépréciation. Lorsque `showDeprecationWarnings` est défini à `true`, tous les avertissements de dépréciation seront passés à ce gestionnaire avec le nom de la méthode comme premier argument et le message original comme second.

::: tip
Cela peut être utile pour enregistrer les messages de dépréciation à un endroit séparé ou pour aider à la mise à jour progressive de la base de code vers la dernière version de test utils en ignorant certains avertissements de fonctions dépréciées.
:::

Example:

```js
import { config } from '@vue/test-utils'

config.showDeprecationWarnings = true
config.deprecationWarningHandler = (method, message) => {
  if (method === 'emittedByOrder') return

  console.error(msg)
}
```

### `stubs`

- type: `{ [name: string]: Component | boolean | string }`
- default: `{}`

Le stub stocké dans `config.stubs` est utilisé par défaut.
Les stubs sont à utiliser dans les composants. Ils sont écrasés par les `stubs` passés dans les options de montage.

Lorsque l'on passe des `stubs` sous forme de tableau dans les options de montage, les `config.stubs` sont convertis en un tableau, et vont stuber les composants avec un composant de base qui retourne `<${component name}-stub>`.

Exemple:

```js
import { config } from '@vue/test-utils'

config.stubs['my-component'] = '<div />'
```

### `mocks`

- type: `Object`
- default: `{}`

Comme pour les `stubs`, les valeurs passées à `config.mocks` sont utilisées par défaut. Toute valeur passées à l'objet d'options de montage `mocks` aura la priorité sur celles déclarées dans `config.mocks`.

Exemple:

```js
import { config } from '@vue/test-utils'

config.mocks['$store'] = {
  state: {
    id: 1
  }
}
```

### `methods`

- type: `{ [name: string]: Function }`
- default: `{}`

Vous pouvez configurer les méthodes par défaut en utilisant l'objet `config`. Cela peut être utile pour les plugins qui injectent des méthodes aux composants, comme [VeeValidate](https://logaretm.github.io/vee-validate/). Vous pouvez surcharger les méthodes définies dans `config` en passant des `méthodes` dans les options de montage.

Exemple:

```js
import { config } from '@vue/test-utils'

config.methods['getData'] = () => {}
```

### `provide`

- type: `Object`
- default: `{}`

Comme les `stubs` ou `mocks`, les valeurs passées à "config.provide" sont utilisées par défaut. Toutes les valeurs passées à l'objet d'options de montage `provide` auront la priorité sur celles déclarées dans `config.provide`. **Veuillez noter qu'il n'est pas possible de passer une fonction comme `config.provide`.**

Exemple:

```js
import { config } from '@vue/test-utils'

config.provide['$logger'] = {
  log: (...args) => {
    console.log(...args)
  }
}
```
