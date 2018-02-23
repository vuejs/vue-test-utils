# createLocalVue()

- **Retorna:**
  - `{Component}`

- **Uso:**

O `createLocalVue` retorna uma classe do Vue para que você possa adicionar componentes, mixins e plugins sem poluir sua classe global do Vue.

Usando com o `options.localVue`

```js
import { createLocalVue, shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const localVue = createLocalVue()
const wrapper = shallow(Foo, {
  localVue,
  mocks: { foo: true }
})

expect(wrapper.vm.foo).toBe(true)

const wrapperSemMock = shallow(Foo)

expect(wrapperSemMock.vm.foo).toBe(false)
```

- **Veja também:** [Dicas comuns](../guides/common-tips.md#applying-global-plugins-and-mixins)
