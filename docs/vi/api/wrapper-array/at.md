## at

Trả về `Wrapper` tại giá trị `index` truyền vào. Sử dụng thứ tự bắt đầu là 0.

- **Các tham số:**

  - `{number} index`

- **Trả về:** `{Wrapper}`

- **Ví dụ:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
const divArray = wrapper.findAll('div')
const secondDiv = divArray.at(1)
expect(secondDiv.is('p')).toBe(true)
```
