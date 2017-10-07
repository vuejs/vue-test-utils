# update()

- **使い方:**

Vueコンポーネントを強制的に再レン​​ダリングします。

`vm`を含む`Wrapper`で呼び出された場合、`Wrapper`、`vm`を強制的に再レン​​ダリングします。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.vm.bar).to.equal('bar')
wrapper.vm.bar = 'new value'
wrapper.update()
expect(wrapper.vm.bar).to.equal('new value')
```