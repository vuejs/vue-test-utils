## Bắt đầu

### Cài đặt

Cách nhanh nhất để lướt sơ cách sử dụng Vue Test Utils, clone demo repository, trong đó đã bao gồm các cài đặt căn bản, bạn chỉ cần chạy install các dependencies:

```bash
git clone https://github.com/vuejs/vue-test-utils-getting-started
cd vue-test-utils-getting-started
npm install
```

Bên trong project sẽ có 1 component đơn giản `counter.js`:

```js
// counter.js

export default {
  template: `
    <div>
      <span class="count">{{ count }}</span>
      <button @click="increment">Increment</button>
    </div>
  `,

  data() {
    return {
      count: 0
    }
  },

  methods: {
    increment() {
      this.count++
    }
  }
}
```

### Mount Component

Vue Test Utils test Vue component bằng cách mount nó một cách độc lập, giả lập các giá trị đầu vào cần thiết (prop, user event) và đánh giả kết quả trả về (render, emit một event).

Component đã mount sẽ trả về bên trong 1 [Wrapper](../api/wrapper/), với nhiều phương thức để chúng ta tương tác bên trong Vue component.

Bạn có thể wrapper sử dụng phương thức `mount`. Tạo một file để test đặt tên là `test.js`:

```js
// test.js

// Import phương thức `mount()` từ test utils
// và component muốn test
import { mount } from '@vue/test-utils'
import Counter from './counter'

// mout component và bạn nhận được một wrapper
const wrapper = mount(Counter)

// bạn có thể truy cập Vue instance của component đó bằng `wrapper.vm`
const vm = wrapper.vm

// Console để biết được tất cả giá trị đang có trong wrapper
// hành trình với Vue Test Utils của bạn bắt đầu từ đây
console.log(wrapper)
```

### Test HTML đã render

Giờ chúng ta đã có wrapper, đầu tiên chúng ta muốn đảm bảo HTML render ra khớp với chúng ta mong đợi.

```js
import { mount } from '@vue/test-utils'
import Counter from './counter'

describe('Counter', () => {
  // giờ mount component và bạn sẽ có wrapper
  const wrapper = mount(Counter)

  it('renders the correct markup', () => {
    expect(wrapper.html()).toContain('<span class="count">0</span>')
  })

  // kiểm tra một element có tồn tại hay không rất đơn giản
  it('has a button', () => {
    expect(wrapper.contains('button')).toBe(true)
  })
})
```

Chạy test với `npm test`. Bạn sẽ thấy kết quả pass

### Giả lập tương tác của user

Giá trị counter sẽ tăng khi user click nút increment. Để giả lập hoạt động này, chúng ta cần xác định nút đó bằng `wrapper.find()`, nó sẽ trả về **wraper của button**. Chúng ta giả lập hành động click bằng cách gọi `.trigger()` trên wrapper của button:

```js
it('button click should increment the count', () => {
  expect(wrapper.vm.count).toBe(0)
  const button = wrapper.find('button')
  button.trigger('click')
  expect(wrapper.vm.count).toBe(1)
})
```

### `nextTick` thì sao?

Vue sẽ hoản lại việc cập nhập DOM, và áp dúng một cách bất tuần tự để tránh việc re-render không cần thiết nhiều lần gây ra bởi thay đổi data thường xuyên. Đó là lý do tại sao, trong thực tế, chúng ta thường phải sử dụng `Vue.nextTick` để đợi đến khi Vue đã thực hiện xong update DOM, sau đó chúng ta gọi thay đổi state.

Để đơn giản hóa, Vue Test Utils áp dụng chiến lược update một cách tuần tự, bạn không cần dùng `Vue.nextTick` để đợi đến khi DOM update.

_Lưu ý: `nextTick` vẫn cần thiết khi bạn cần đến các lợi ích cao hơn của event looop, cho những hành động như gọi callback asyn, hoặc promise._

Nếu bạn vẫn cần đùng đến `nextTick` trong test, nhớ rằng bất kỳ error nào được throw trong đó có thể không bị bắt lại bởi test runner. Có 2 phương pháp để fix cái này: set `done` bên trong callback cho đối tượng `Vue.config.errorHandler`, hoặc bạn có thể gọi `nextTick` mà không truyền vào tham số gì cả và return một promise.

```js
// sẽ không bị bắt lại
it('will time out', done => {
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

// 2 test như bên dưới sẽ hoạt động bình thường
it('will catch the error using done', done => {
  Vue.config.errorHandler = done
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

it('will catch the error using a promise', () => {
  return Vue.nextTick().then(function() {
    expect(true).toBe(false)
  })
})
```

### Tiếp theo

- Tích hợp Vue Test Utils trong project của bạn bằng cách [chọn một test runner](./choosing-a-test-runner.md).
- Đọc thêm [các ký thuật căn bản khi viết test](./common-tips.md).
