# at(index)

渡された`index`の`Wrapper`を返します。ゼロベースの番号付けを使用します(つまり、最初のアイテムはインデックス0になります)。

- **引数:**
  - `{number} index`

- **戻り値:** `{Wrapper}`

- **例:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')
const secondDiv = divArray.at(1)
expect(secondDiv.is('p')).to.equal(true)
```
