## setChecked(value)

`<input>` のラジオボタンまたはチェックボックスに値を設定します。

- **引数:**
  - `{Boolean} selected`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const option = wrapper.find('input[type="radio"]')
option.setChecked()
```

