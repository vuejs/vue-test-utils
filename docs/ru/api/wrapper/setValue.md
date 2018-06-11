## setValue(value)

Устанавливает значение текстового `<input>`.

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