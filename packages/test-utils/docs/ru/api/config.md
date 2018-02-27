# Конфигурация

vue-test-utils включает в себя объект конфигурации для определения опций, используемых vue-test-utils.

## Конфигурация настроек `vue-test-utils`

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