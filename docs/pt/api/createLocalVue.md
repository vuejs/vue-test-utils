## O método createLocalVue()

- **Argumentos:**

  - `{Object} options`
    - `{Function} errorHandler`

- **Retorna:**

  - `{Component}`

- **Uso:**

O `createLocalVue` retorna uma classe do Vue para você adicionar componentes, mixins (combinadores) e instalar plugins sem poluir a classe global do Vue.

A opção `errorHandler` pode ser usada para manipular erros não capturados durante a função de renderizar do componente e observadores.

Use ele com `options.localVue`:

**Sem as opções:**

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import MyPlugin from 'my-plugin'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(MyPlugin)
const wrapper = shallowMount(Foo, {
  localVue,
  mocks: { foo: true }
})
expect(wrapper.vm.foo).toBe(true)

const freshWrapper = shallowMount(Foo)
expect(freshWrapper.vm.foo).toBe(false)
```

**Com a opção [`errorHandler`](https://vuejs.org/v2/api/#errorHandler):**

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const errorHandler = (err, vm, info) => {
  expect(err).toBeInstanceOf(Error)
}

const localVue = createLocalVue({
  errorHandler
})

// Foo lança um erro dentro um gatilho do ciclo de vida
const wrapper = shallowMount(Foo, {
  localVue
})
```

- **Consulte também:** [Dicas Comuns](../guides/common-tips.md#applying-global-plugins-and-mixins)
