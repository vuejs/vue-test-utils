# TransitionStub

Компонент для создания заглушки компонента `transition`. Вместо асинхронного выполнения переходов он возвращает дочерний компонент синхронно.

Это настроено на заглушку всех компонентов `transition` по умолчанию в конфигурации vue-test-utils. Чтобы использовать стандартный компонент `transition` установите `config.stubs.transition` в значение false:

```js
import VueTestUtils from 'vue-test-utils'

VueTestUtils.config.stubs.transition = false
```

Чтобы переустановить обратно на заглушки компонентов `transition`:
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