## createLocalVue()

- **Возвращает:**

  - `{Component}`

- **Использование:**

`createLocalVue` возвращает класс Vue, чтобы вы могли добавлять компоненты, примеси и устанавливать плагины без загрязнения глобального класса Vue.

Используйте вместе с `options.localVue`:

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

- **См. также:** [Общие советы](../guides/common-tips.md#добавnение-гnобаnьных-пnагинов-и-примесей)
