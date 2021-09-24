## setValue

Définis la valeur d'une entrée de contrôle de texte ou d'un élément de sélection et met à jour les données liées au `v-model`.

- **Arguments:**

  - `{any} value`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)

const textInput = wrapper.find('input[type="text"]')
textInput.setValue('some value')

const select = wrapper.find('select')
select.setValue('option value')

// nécessite <select multiple>
const multiselect = wrapper.find('select')
multiselect.setValue(['value1', 'value3'])
```

- **Note:**

- `textInput.setValue(value)` est un alias du code suivant.

  ```js
  textInput.element.value = value
  textInput.trigger('input')
  ```

  - `select.setValue(value)` est un alias du code suivant.

  ```js
  select.element.value = value
  select.trigger('change')
  ```
