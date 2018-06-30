## setValue(value)

Устанавливает значение ввода текстового элемента и обновляет связанные данные `v-model`.

- **Аргументы:**
  - `{String} value`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const input = wrapper.find('input[type="text"]')
input.setValue('some value')
```

- **Примечание:**

`textInput.setValue(value)` — псевдоним следующего кода.

```js
textInput.element.value = value
textInput.trigger('input')
```
