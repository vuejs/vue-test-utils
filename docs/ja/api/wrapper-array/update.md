# update()

`WrapperArray` の各 `Wrapper` のルート Vue コンポーネントを強制的に再描画します。

ラップされた Vue コンポーネント配列において呼び出された場合、各 Vue コンポーネントは強制的に再描画します。

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.at(0).vm.bar).toBe('bar')
divArray.at(0).vm.bar = 'new value'
divArray.update()
expect(divArray.at(0).vm.bar).toBe('new value')
```
