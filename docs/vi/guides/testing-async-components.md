## Test các hoạt động Async

Để đơn giản hóa, Vue Test Utils áp dụng cách cập nhập DOM _tuần tự_. Tuy nhiên, có những kỹ thuật bạn cần biết khi test component với các hoạt động async như callback và promise.

Một trong những hoạt động async phổ biến là gọi API với Vuex action. Ví dụ bên dưới sẽ cho thấy cách test một phương thức gọi một API. Ví dụ này sử dụng Jest để test và giả lập một HTTP qua `axios`. Để biết thêm các phương pháp giả lập thủ công có thể [đọc ở đây](https://jestjs.io/docs/en/manual-mocks#content)

Hiện thực giả lập `axios` như sau:

```js
export default {
  get: () => Promise.resolve({ data: 'value' })
}
```

Component bên dưới cho phép gọi API khi click vào button, sau đó gán lại kết quả này cho `value`.

```html
<template>
  <button @click="fetchResults" />
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        value: null
      }
    },

    methods: {
      async fetchResults() {
        const response = await axios.get('mock/service')
        this.value = response.data
      }
    }
  }
</script>
```

Test được viết như thế này:

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo'
jest.mock('axios')

it('fetches async when a button is clicked', () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  expect(wrapper.vm.value).toBe('value')
})
```

Kết quả test này hiện tại đang fail vì kiểm tra trước khi promise được resolve trong `fetchResults`. Hầu hết các thư viện unit test cung cấp một callback để runner biết khi nào test kết thúc. Jest và Mocha đều dùng `done`. Chúng ta có thể dùng `done` kết hợp với `$nextTick` hoặc `setTimeout` để đảm bảo bất cứ promise nào cũng chạy xong trước khi bắt đầu kiểm tra.

```js
it('fetches async when a button is clicked', done => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  wrapper.vm.$nextTick(() => {
    expect(wrapper.vm.value).toBe('value')
    done()
  })
})
```

Lý do `setTimeout` cho kết quả pass vì microtask queue nơi promise callback được thực thi, chạy trước task queue, nơi `setTimeout` chạy. Nghĩa là trong thời gian `setTimeout` callback được chạy, bất kỳ promise callback trên microtask queue đã được thực thi. `$nextTick` ở phương diện khác, schedule một microtask, nhưng vì microtask queue được tiến hành theo phương pháp first-in-first-out, đồng thời cùng đảm bảo promise callback đã chạy khi bắt đầu kiểm tra. Xem [ở đây](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) để có giải thích chi tiết hơn.

Một giải pháp khác là sử dụng một function `async` và cài package `flush-promises`. `flush-promises` sẽ đưa tất cả những promise nào chưa resolve về resolve ngay lập tức. Bạn có thể `await` hàm `flushPromises` để dễ đọc hơn.

Test được cập nhập lại như sau:

```js
import { shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Foo from './Foo'
jest.mock('axios')

it('fetches async when a button is clicked', async () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  await flushPromises()
  expect(wrapper.vm.value).toBe('value')
})
```

Kỹ thuật này có thể sử dụng với Vuex action, vốn dĩ cũng trả về một promise.
