# TransitionGroupStub

Компонент для создания заглушки компонента `transition-group`. Вместо асинхронного выполнения переходов он возвращает дочерние компоненты синхронно.

Это настроено на заглушку всех компонентов `transition-group` по умолчанию в конфигурации vue-test-utils. Чтобы использовать встроенную обёртку компонента `transition-group` установите `config.stubs[transition-group]` в значение false:

```js
import VueTestUtils from 'vue-test-utils'

VueTestUtils.config.stubs.transition = false
```

Чтобы переустановить обратно на компоненты-заглушки:
```js
import VueTestUtils, { TransitionGroupStub } from 'vue-test-utils'

VueTestUtils.config.stubs['transition-group'] = TransitionGroupStub
```

Для установки заглушек в настройках монтирования:

```js
import { mount, TransitionGroupStub } from 'vue-test-utils'

mount(Component, {
  stubs: {
    'transition-group': TransitionGroupStub
  }
})
```