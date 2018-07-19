## setSelected(value)

指定された `<option>` を `<select>` で選択されたものとして設定します。

- **引数:**
  - `{Boolean} selected`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
const options = wrapper.find('select').findAll('option')

options.at(1).setSelected()
expect(wrapper.text()).to.contain('option1')
```
