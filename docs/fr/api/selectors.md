## Les Sélecteurs

Beaucoup de méthodes prennent un sélecteur comme argument. Un sélecteur peut être soit un sélecteur CSS, un composant Vue ou un objet d'option de recherche.

### Les sélecteurs CSS

Mount gère tous les sélecteurs CSS valide :

- sélecteur de balise (`div`, `foo`, `bar`)
- sélecteur de classe(`.foo`, `.bar`)
- sélecteur d'attribut(`[foo]`, `[foo="bar"]`)
- sélecteur d'ID (`#foo`, `#bar`)
- sélecteur de pseudo-classe (`div:first-of-type`)

Vous pouvez également utiliser des combinateurs:

- combinateurs de descendance direct (`div > #bar > .foo`)
- combinateurs de descendance général (`div #bar .foo`)
- sélecteur de frére adjacent (`div + .foo`)
- sélecteur de frère général (`div ~ .foo`)

### Les composants Vue

Les composants de Vue sont également des sélecteurs valables.

```js
// Foo.vue

export default {
  name: 'FooComponent'
}
```

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
expect(wrapper.is(Foo)).toBe(true)
```

### L'option objet `find`

#### Name

En utilisant un objet d'option de recherche, Vue Test Utils permet de sélectionner des éléments par un `name` de composant sur les composants wrapper.

```js
const buttonWrapper = wrapper.find({ name: 'my-button' })
buttonWrapper.trigger('click')
```

#### Ref

En utilisant un objet d'option de recherche, Vue Test Utils permet de sélectionner des éléments par `$ref` sur les composants wrapper

```js
const buttonWrapper = wrapper.find({ ref: 'myButton' })
buttonWrapper.trigger('click')
```
