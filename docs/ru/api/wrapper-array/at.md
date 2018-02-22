# at(index)

Возвращает `Wrapper` по указанному индексу `index`. Используется нумерация с нуля (т.е. первый элемент имеет индекс 0).

- **Принимает:**
  - `{number} index`

- **Возвращает:** `{Wrapper}`

- **Пример:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')
const secondDiv = divArray.at(1)
expect(secondDiv.is('p')).toBe(true)
```
