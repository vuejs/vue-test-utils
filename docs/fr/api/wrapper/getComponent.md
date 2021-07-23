## getComponent

Fonctionne comme [findComponent](./findComponent.md) mais génère une erreur si rien ne correspond au sélecteur donné.
le sélecteur donné n'est trouvé. Vous devriez utiliser `findComponent` lorsque vous recherchez un élément qui peut ne pas exister. Vous devriez utiliser cette méthode lorsque vous obtenez un élément qui devrait exister et il fournira un message d'erreur sympa si ce n'est pas le cas.

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

// Similaire à `wrapper.findComponent`.
// `getComponent` lancera une erreur si un élément n'est pas trouvé. `findComponent` ne fera rien.
expect(wrapper.getComponent(Bar)) // => gets Bar by component instance
expect(wrapper.getComponent({ name: 'bar' })) // => gets Bar by `name`
expect(wrapper.getComponent({ ref: 'bar' })) // => gets Bar by `ref`

expect(() => wrapper.getComponent({ name: 'does-not-exist' }))
  .to.throw()
  .with.property(
    'message',
    "Unable to get a component named 'does-not-exist' within: <div>the actual DOM here...</div>"
  )
```
