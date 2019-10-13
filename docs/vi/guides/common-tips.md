## Kỹ thuật phổ biến

### Biết Test cái gì

Với component UI, chúng tôi không mục tiêu test coverage trên từng line, bởi vì nó sẽ dẫn tới việc tập trung quá nhiều vào chi tiết hiện thực bên trong của component.

Thay vì đó, chúng tôi đề nghị viết test để kiểm tra những public interface của component và xem các phương thức bên trong đó như black box. Một test case nên kiểm tra với các giá trị input như vậy sẽ cho ra các giá trị output như mong đợi.

Ví dụ, với component `Counter`, khi click increment button, giá trị counter sẽ tăng lên 1, test case cho nó nên giả lập click và kiểm tra kết quả output render đã tăng lên 1. Test không nên kiểm tra làm cách nào `Counter` đã tăng giá trị đó, nó chỉ quan tâm về input và output.

Lợi ích của cách tiếp cận này là miễn các public interface của component vẫn giữ nguyên, thì test sẻ pass không cần quan tâm bên trong code có thay đổi hiện thực theo thời gian.

Chủ đề này được thảo luận chi tiết hơn [trong phần trình bày của Matt O'Connell](https://www.youtube.com/watch?v=OIpfWTThrK8).

### Render Ngầm

Trong unit test, chúng ta thường chỉ tập trung vào component chúng ta muốn test, một cách tách biệt, tránh quan tâm đến hoạt động của các component con.

Thêm nữa, với các component chứa nhiều component con, quá trình render cây component có thể sẽ rất lớn. Cứ lập lại việc render tất cả child component có thể làm giảm quá trình test.

Vue Test Utils cho phép bạn mount một component mà không cần render các component con (bằng cách xóa node đó) với phương thức `shallowMount`:

```js
import { shallowMount } from '@vue/test-utils'

const wrapper = shallowMount(Component)
wrapper.vm // the mounted Vue instance
```

### Xác nhận các Event được emit

Mỗi wrapper đã mount sẽ tự động thu nhận tất cả emit event bên dưới Vue instance. Bạn có thể lấy được các event đã record bằng cách sử dụng phương thức `wrapper.emitted()`:

```js
wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
`wrapper.emitted()` returns the following object:
{
  foo: [[], [123]]
}
*/
```

Bạn có thể xác nhận dựa vào các dự liệu nhận được:

```js
// assert event has been emitted
expect(wrapper.emitted().foo).toBeTruthy()

// assert event count
expect(wrapper.emitted().foo.length).toBe(2)

// assert event payload
expect(wrapper.emitted().foo[1]).toEqual([123])
```

Bạn cũng có thể lấy Array các event theo thứ tự đã emit [`wrapper.emittedByOrder()`](../api/wrapper/emittedByOrder.md).

### Emit Event từ Component con

Bạn có thể emit một event tùy biến từ một component con bằng cách truy cập vào instance.

**Component sẽ test**

```html
<template>
  <div>
    <child-component @custom="onCustom" />
    <p v-if="emitted">Emitted!</p>
  </div>
</template>

<script>
  import ChildComponent from './ChildComponent'

  export default {
    name: 'ParentComponent',
    components: { ChildComponent },
    data() {
      return {
        emitted: false
      }
    },
    methods: {
      onCustom() {
        this.emitted = true
      }
    }
  }
</script>
```

**Test**

```js
import { shallowMount } from '@vue/test-utils'
import ParentComponent from '@/components/ParentComponent'
import ChildComponent from '@/components/ChildComponent'

describe('ParentComponent', () => {
  it("displays 'Emitted!' when custom event is emitted", () => {
    const wrapper = shallowMount(ParentComponent)
    wrapper.find(ChildComponent).vm.$emit('custom')
    expect(wrapper.html()).toContain('Emitted!')
  })
})
```

### Thay đổi state Component

Bạn có thể tự tay thay đổi state của component bằng cách sử dùng phương thức `setData` hoặc `setProps` của wrapper:

```js
wrapper.setData({ count: 10 })

wrapper.setProps({ foo: 'bar' })
```

### Giả lập Prop

Bạn có thể truyền prop vào trong component sử dụng `propsData`

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  propsData: {
    aProp: 'some value'
  }
})
```

Hoặc thay đổi giá trị của prop sau khi component đã được mount `wrapper.setProps({})`

_Để xem danh sách đầy đủ các option có thể truyền vào, vui lòng xem [mục mount option](../api/options.md)._

### Áp dụng Global Plugin và Mixin

Một vài component có thể phụ thuộc vào tính năng được nhúng vào trong plugin hoặc mixin, ví dụ `vuex` và `vue-router`.

Nếu bạn viết test cho component với một ứng dụng thực tế, bạn có thể setup vài global plugin và mixin trong toàn bộ các test. Tuy nhiên trong vài trường hợp, ví dụ như bộ test suite được sử dụng trên nhiều project khác nhau, tốt nhất nên test component trong một bộ cài đặt riêng, không dùng các phương thức global `Vue`. Bạn có thể sử dụng [`createLocalVue`](../api/createLocalVue.md) để làm:

```js
import { createLocalVue, mount } from '@vue/test-utils'

// create an extended `Vue` constructor
const localVue = createLocalVue()

// install plugins as normal
localVue.use(MyPlugin)

// pass the `localVue` to the mount options
mount(Component, {
  localVue
})
```

**Lưu ý với một vài plugin, như Vue Router, các giá trị khởi tạo của nó là read-only. Làm cho việc install một lần nữa bằng localValue là không thể, hoặc thêm các giả lập với giá trị read-only**

### Nhúng giả lập

Một cách tiếp cận khác để nhúng prop khá đơn giản là giả lập nó. Bạn có thể làm điều này bằng option `mocks`:

```js
import { mount } from '@vue/test-utils'

const $route = {
  path: '/',
  hash: '',
  params: { id: '123' },
  query: { q: 'hello' }
}

mount(Component, {
  mocks: {
    // adds mocked `$route` object to the Vue instance
    // before mounting component
    $route
  }
})
```

### Xóa một component

Bạn có thể xóa component đã đăng ký global hoặc local bằng cách sử dụng option `stubs`:

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  // Will resolve globally-registered-component with
  // empty stub
  stubs: ['globally-registered-component']
})
```

### Làm việc với Routing

Vì routing theo định nghĩa là một kiến trúc tổng quát của ứng dụng và được bao gồm rất nhiều component, tốt nhất nên test nó trong phần test tích hợp, hay end-to-end test. Với từng component chỉ phụ thuộc vào tính năng `vue-router`, bạn có thể giả lập chúng bằng cách sử dụng kỹ thuật đã đề cập ở trên.

### Kiểm tra style

Bạn chỉ có thể xác định inline style khi chạy `jsdom`.
