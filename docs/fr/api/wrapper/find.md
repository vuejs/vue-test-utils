## find

::: warning Avertissement de déprédation
L'utilisation de `find` pour rechercher un composant est déconseillée et sera supprimée. Utilisez plutôt [findComponent](https://vue-test-utils.vuejs.org/api/wrapper/findComponent.html).
La méthode `find` continuera à fonctionner pour trouver des éléments en utilisant n'importe quel [selector] valide (../selectors.md).
:::

Retourne le "wrapper" du premier nœud DOM ou le sélecteur de composants Vue correspondant.

Utilisez n'importe quel sélecteur DOM valide (utilise la syntaxe querySelector).

- **Arguments:**

  - `{string} selector`

- **Retours:** `{Wrapper}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const div = wrapper.find('div')
expect(div.exists()).toBe(true)

const byId = wrapper.find('#bar')
expect(byId.element.id).toBe('bar')
```

- **Note:**

  - Vous pouvez enchaîner les appels find ensemble :

```js
const button = wrapper.find({ ref: 'testButton' })
expect(button.find('.icon').exists()).toBe(true)
```

Voir aussi : [get](./get.md).
