## is

::: warning Avertissement de déprédation
L'utilisation de `is` pour affirmer que le nœud DOM est déprécié et sera supprimé.

Considérez un appariement personnalisé tel que ceux fournis dans [jest-dom](https://github.com/testing-library/jest-dom#custom-matchers).
ou pour l'assertion de type d'élément DOM, utilisez native [`Element.tagName`](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName) à la place.

Pour conserver ces tests, un remplacement valable pour :

- `is('DOM_SELECTOR')` est une affirmation de `wrapper.wrappers.every(wrapper => wrapper.element.tagName === 'DOM_SELECTOR')`.
- `is('ATTR_NAME')` est une affirmation véridique d `wrapper.wrappers.every(wrapper => wrapper.attributes('ATTR_NAME'))`.
- `is('CLASS_NAME')` est une affirmation véridique d `wrapper.wrappers.every(wrapper => wrapper.classes('CLASS_NAME'))`.

L'affirmation contre la définition du composant n'est pas dépréciée

En cas d'utilisation avec findComponent, accédez à l'élément DOM avec `findComponent(Comp).element`
:::

Affirmer que chaque `Wrapper` dans le noeud DOM `WrapperArray` ou `vm` correspond à [selector](../selectors.md).

- **Arguments:**

  - `{string|Component} selector`

- **Retours:** `{boolean}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.is('div')).toBe(true)
```
