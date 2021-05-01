## setSelected

Sélectionne un élément d'option et met à jour les données liées au `v-model`.

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const options = wrapper.find('select').findAll('option')

options.at(1).setSelected()
```

- **Note:**

Lorsque vous essayez de mettre la valeur à state via `v-model` par `option.element.selected = true ; parentSelect.trigger('input')`, `v-model` n'est pas déclenché. Le `v-model` est déclenché par l'événement `change`.

`option.setSelected()` est un alias du code suivant.

```js
option.element.selected = true
parentSelect.trigger('change')
```
