# Конфигурация

Vue Test Utils включает объект конфигурации для определения опций, используемых Vue Test Utils.

## Конфигурация настроек Vue Test Utils`

### `stubs`

- Тип: `Object`
- По умолчанию: `{
  transition: TransitionStub,
  'transition-group': TransitionGroupStub
}`

Заглушки указанные в `config.stubs` используются по умолчанию.
Заглушки, используемые в компонентах. Они перезаписываются значениями `stubs` переданными в настройках монтирования.

При передаче `stubs` в качестве массива в настройках монтирования, `config.stubs` будет преобразована в массив, и будут создаваться компоненты заглушки с базовым компонентом, который возвращает div.

Пример:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs['my-component'] = '<div />'
```

### `mocks`

- type: `Object`
- default: `{}`

По аналогии с `stubs`, значения, переданные в `config.mocks` используются по умолчанию. Любые значения, переданные настройкам монтирования объекта `mocks`, будут иметь приоритет выше, по сравнению с объявленными в `config.mocks`.

Example:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.mocks['$store'] = {
  state: {
    id: 1
  }
}
```

### `methods`

- type: `Object`
- default: `{}`

Вы можете настроить методы по умолчанию с помощью объекта `config`. Это может быть полезно для плагинов, которые вводят методы в компоненты, такие как [VeeValidate](https://vee-validate.logaretm.com/). Вы можете переопределить методы, установленные в `config`, передав `methods` в настройках монтирования.

Example:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.methods['errors'] = () => {
  any: () => false
}
```

### `provide`

- type: `Object`
- default: `{}`

Как `stubs` или `mocks`, значения, переданные `config.provide`, используются по умолчанию. Любые значения, переданные настройкам монтирования объекта `provide`, будут иметь приоритет выше по сравнению с объявленными в `config.provide`. **Обратите внимание, что не поддерживается передача функции в качестве `config.provide`.**

Пример:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.provide['$logger'] = {
  log: (...args) => {
    console.log(...args)
  }
}
```

### `logModifiedComponents`

- type: `Boolean`
- default: `true`

Логирует о предупреждениях, когда для расширенных дочерних компонентов автоматически создаётся заглушка. Скрывает предупреждения, когда установлено значение `false`. В отличие от других опций конфигурации, это невозможно установить в настройках монтирования.

Пример:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.logModifiedComponents = false
```

### `silentWarnings`
 
- type: `Boolean`
- default: `true`
 
Подавляет предупреждения, вызванные Vue во время изменения наблюдаемых компонентов (например, входных параметров). Если установлено значение `false`, все предупреждения показываются в консоли. Это настраиваемый способ, который основывается на `Vue.config.silent`.
Example:
 
```js
import VueTestUtils from '@vue/test-utils'
 
VueTestUtils.config.silentWarnings = false
```