## createLocalVue()

- **Arguments:**

  - `{Object} options`
    - `{Function} errorHandler`

- **Retours:**

  - `{Component}`

- **Usage:**

`createLocalVue` renvoie une classe Vue pour que vous puissiez ajouter des composants, des mixins et installer des plugins sans polluer la classe Vue globale.

L'option `errorHandler` peut être utilisée pour gérer les erreurs non attrapées pendant la fonction de rendu du composant et les observateurs.

Utilisez-la avec `options.localVue`:

**Sans les options:**

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

**Avec l'option [`errorHandler`](https://vuejs.org/v2/api/#errorHandler):**

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const errorHandler = (err, vm, info) => {
  expect(err).toBeInstanceOf(Error)
}

const localVue = createLocalVue({
  errorHandler
})

// Foo lance une erreur à l'intérieur d'un crochet de cycle de vie
const wrapper = shallowMount(Foo, {
  localVue
})
```

- **Voir aussi:** [Common Tips](../guides/common-tips.md#applying-global-plugins-and-mixins)
