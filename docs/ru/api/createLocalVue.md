# `createLocalVue()`

- **Возвращает:**
  - `{Component}`

- **Использование:**

`createLocalVue` возвращает класс Vue, чтобы вы могли добавлять компоненты, примеси и устанавливать плагины без загрузнения глобального класса Vue.

Используйте вместе с `options.localVue`:

```js
import { createLocalVue, shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const localVue = createLocalVue()
const wrapper = shallow(Foo, {
  localVue,
  mocks: { foo: true }
})
expect(wrapper.vm.foo).toBe(true)

const freshWrapper = shallow(Foo)
expect(freshWrapper.vm.foo).toBe(false)
```

- **См. также:** [Общие советы](../guides/common-tips.md#applying-global-plugins-and-mixins)
