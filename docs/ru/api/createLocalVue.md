## createLocalVue()

- **Аргументы:**

  - `{Object} options`
    - `{Function} errorHandler`

- **Возвращает:**

  - `{Component}`

- **Использование:**

`createLocalVue` возвращает класс Vue, чтобы вы могли добавлять компоненты, примеси и устанавливать плагины без загрязнения глобального класса Vue.

Опция [errorHandler](https://ru.vuejs.org/v2/api/index.html#errorHandler) может использоваться для обработки неперехваченных ошибок во время функции визуализации компонента и наблюдателей.

Используйте вместе с `options.localVue`:

**Без опций:**

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const localVue = createLocalVue()
const wrapper = shallowMount(Foo, {
  localVue,
  mocks: { foo: true }
})
expect(wrapper.vm.foo).toBe(true)

const freshWrapper = shallowMount(Foo)
expect(freshWrapper.vm.foo).toBe(false)
```

**С опцией [errorHandler](https://ru.vuejs.org/v2/api/index.html#errorHandler):**

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const errorHandler = (err, vm, info) => {
  expect(err).toBeInstanceOf(Error)
}

const localVue = createLocalVue({
  errorHandler
})

// Foo выдает ошибку внутри ловушки жизненного цикла
const wrapper = shallowMount(Foo, {
  localVue
})
```

- **См. также:** [Общие советы](../guides/common-tips.md#добавnение-гnобаnьных-пnагинов-и-примесей)
