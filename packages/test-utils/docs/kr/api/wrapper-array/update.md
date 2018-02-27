# update()

`WrapperArray`의 모든 `Wrapper`의 루트 Vue 컴포넌트를 다시 렌더링합니다.

Vue 컴포넌트 래퍼 배열에서 호출되면 각 Vue 컴포넌트가 강제로 다시 렌더링됩니다.


- **예제:**

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
