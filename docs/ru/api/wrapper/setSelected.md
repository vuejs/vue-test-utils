## setSelected()

Выбирает элемент пункта списка и обновляет связанные данные `v-model`.

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const options = wrapper.find('select').findAll('option')

options.at(1).setSelected()
```

- **Примечание:**

Когда вы пытаетесь установить значение в состояние через `v-model` с помощью `option.element.selected = true; parentSelect.trigger('input')`, `v-model` не вызывается. `v-model` генерируется событием `change`.

`option.setSelected()` — псевдоним для следующего кода.

```js
option.element.selected = true
parentSelect.trigger('change')
```
