# at(index)

입력한 `index` 순서(번호)에 해당하는 `Wrapper`를 반환합니다. 0부터 시작합니다. (첫번째 아이템의 인덱스는 0입니다.).

- **전달인자:**
  - `{number} index`

- **반환값:** `{Wrapper}`

- **예제:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')
const secondDiv = divArray.at(1)
expect(secondDiv.is('p')).toBe(true)
```
