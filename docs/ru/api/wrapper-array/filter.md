## filter(predicate)

Фильтр `WrapperArray` с функцией предиката на объектах `Wrapper`.

Поведение этого метода похоже на [Array.prototype.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

- **Аргументы:**
  - `{function} predicate`

- **Возвращает:** `{WrapperArray}`

Новый экземпляр `WrapperArray`, содержащий экземпляры `Wrapper`, которые возвращают true для функции предиката.

- **Example:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
const filteredDivArray = wrapper.findAll('div')
  .filter(w => !w.hasClass('filtered'))
```