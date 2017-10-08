# update()

`WrapperArray`の各`Wrapper`のルートVueコンポーネントを強制的に再レン​​ダリングします。

ラップされたVueコンポーネント配列において呼び出された場合、各Vueコンポーネントは強制的に再レン​​ダリングされます。

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.at(0).vm.bar).to.equal('bar')
divArray.at(0).vm.bar = 'new value'
divArray.update()
expect(divArray.at(0).vm.bar).to.equal('new value')
```
