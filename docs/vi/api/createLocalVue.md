## createLocalVue()

- **Trả về:**

  - `{Component}`

- **Sử dụng:**

`createLocalVue` trả về một Vue class để bạn thêm component, mixin và cài đặt các plugin mà không ảnh hưởng đến global Vue class.

Sử dụng nó với `options.localVue`:

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const localVue = createLocalVue()
const wrapper = shallowMount(Foo, {
  localVue,
  mocks: { foo: true }
})
expect(wrapper.vm.foo).toBe(true)

const freshWrapper = shallowMount(Foo)
expect(freshWrapper.vm.foo).toBe(false)
```

- **Xem thêm:** [Kỹ thuật phổ biến](../guides/common-tips.md#applying-global-plugins-and-mixins)
