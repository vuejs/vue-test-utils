# TransitionGroupStub

Компонент для создания заглушки компонента `transition-group`. Вместо асинхронного выполнения переходов он возвращает дочерние компоненты синхронно.

Это настроено на заглушку всех компонентов `transition-group` по умолчанию в конфигурации vue-test-utils. Чтобы использовать стандартный компонент `transition-group` установите `config.stubs['transition-group']` в значение false:

```js
import { config } from '@vue/test-utils'

config.stubs['transition-group'] = false
```

Чтобы переустановить обратно на заглушки компонентов `transition-group`:

```js
import { config, TransitionGroupStub } from '@vue/test-utils'

config.stubs['transition-group'] = TransitionGroupStub
```

Для установки заглушек в настройках монтирования:

```js
import { mount, TransitionGroupStub } from '@vue/test-utils'

mount(Component, {
  stubs: {
    'transition-group': TransitionGroupStub
  }
})
```