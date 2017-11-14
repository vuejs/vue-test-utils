# TransitionStub

Компонент для создания заглушки компонента `transition`. Вместо асинхронного выполнения переходов он возвращает дочерний компонент синхронно.

Это настроено на заглушку всех компонентов `transition` по умолчанию в конфигурации vue-test-utils. Чтобы использовать встроенную обёртку компонента `transition` установите `config.stubs.transition` в значение false:

```js
import VueTestUtils from 'vue-test-utils'

VueTestUtils.config.stubs.transition = false
```

Чтобы переустановить обратно на компоненты-заглушки:
```js
import VueTestUtils, { TransitionStub } from 'vue-test-utils'

VueTestUtils.config.stubs.transition = TransitionStub
```

Для установки заглушек в настройках монтирования:

```js
import { mount, TransitionStub } from 'vue-test-utils'

mount(Component, {
  stubs: {
    transition: TransitionStub
  }
})
```