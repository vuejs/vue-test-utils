## setProps

- **Arguments:**

  - `{Object} props`

- **Usage:**

Définir les props de `Wrapper` `vm` et forcer à mettre à jour

Définit les props `Wrapper` `vm` et force la mise à jour.

:: : avertissement
`setProps` ne peut être appelé que pour un composant de haut niveau, monté par `mount` ou `shallowMount`.
:: :

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

test('setProps demo', async () => {
  const wrapper = mount(Foo)

  await wrapper.setProps({ foo: 'bar' })

  expect(wrapper.vm.foo).toBe('bar')
})
```

Vous pouvez également passer un objet `propsData`, qui initialisera l'instance de Vue avec les valeurs passées.

```js
// Foo.vue
export default {
  props: {
    foo: {
      type: String,
      required: true
    }
  }
}
```

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    foo: 'bar'
  }
})

expect(wrapper.vm.foo).toBe('bar')
```
