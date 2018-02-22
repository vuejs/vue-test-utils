# update()

Vue コンポーネントを強制的に再描画します。

`vm` を含む `Wrapper` で呼び出された場合、`Wrapper` `vm` を強制的に再描画します。

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.vm.bar).toBe('bar')
wrapper.vm.bar = 'new value'
wrapper.update()
expect(wrapper.vm.bar).toBe('new value')
```
