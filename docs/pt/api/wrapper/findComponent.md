## O método findComponent

Retorna o `Wrapper` (envolvedor) do primeiro componente de Vue correspondente.

- **Argumentos:**

  - `{Component|ref|string} selector`

- **Retorna:** `{Wrapper}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const bar = wrapper.findComponent(Bar) // => Encontra Bar pela instância do componente
expect(bar.exists()).toBe(true)
const barByName = wrapper.findComponent({ name: 'bar' }) // => encontra Bar pelo `name`
expect(barByName.exists()).toBe(true)
const barRef = wrapper.findComponent({ ref: 'bar' }) // => encontra Bar pelo `ref`
expect(barRef.exists()).toBe(true)
```

::: warning Uso com seletores de CSS
Ao usar `findAllComponents` com o seletor de CSS pode resultar em comportamento confuso

Considere este exemplo:

```js
const ChildComponent = {
  name: 'Child',
  template: '<div class="child"></div>'
}

const RootComponent = {
  name: 'Root',
  components: { ChildComponent },
  template: '<child-component class="root" />'
}

const wrapper = mount(RootComponent)

const rootByCss = wrapper.findComponent('.root') // => encontra o Root
expect(rootByCss.vm.$options.name).toBe('Root')
const childByCss = wrapper.findComponent('.child')
expect(childByCss.vm.$options.name).toBe('Root') // => continua sendo o Root
```

A razão para tal comportamento é que o `RootComponent` e o `ChildComponent` estão partilhando o mesmo nó do DOM e somente o primeiro componente correspondente é íncluido para cada nó do DOM único.
:::
