## setChecked

Définis la valeur cochée pour l'élément d'entrée de type case à cocher ou radio et met à jour les données liées au `v-model`.

- **Arguments:**

  - `{Boolean} checked (default: true)`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const radioInput = wrapper.find('input[type="radio"]')
radioInput.setChecked()
```

- **Note:**

Lorsque vous essayez de mettre la valeur à state via `v-model` par `radioInput.element.checked = true ; radioInput.trigger('input')`, `v-model` n'est pas déclenché. Le `v-model` est déclenché par l'événement `change`.

`checkboxInput.setChecked(checked)` est un alias du code suivant.

```js
checkboxInput.element.checked = checked
checkboxInput.trigger('click')
checkboxInput.trigger('change')
```
