## Sử dụng với Vue Router

### Cài đặt Vue Router trong test

Bạn không bao giờ được cài đặt Vue Router trong Vue constructor chính ở test. Cài đặt Vue Router sẽ thêm `$router` và `$route` như những giá trị read-only của Vue

Để tránh việc đó, chúng ta có thể tạo một `localVue`, và thêm Vue Router vào đó.
To avoid this, we can create a localVue, and install Vue Router on that.

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter()

shallowMount(Component, {
  localVue,
  router
})
```

> **Note:** Cài đặt Vue Router trong `localVue` đồng thời cũng thêm `$route` và `$router` như giá trị read-only trong `localVue`. Điều đó nghĩa là không thể sử dụng `mocks` để ghi đè `$route` và `$router` khi mount một component sử dụng `localValue` với Vue Router đã cài đặt

### Test component sử dụng `router-link` hoặc `router-view`

Khi bạn cái Vue Router, component `router-link` và `router-view` đồng thời cũng được đăng ký. Nghĩa là chúng ta có thể sử dụng bất kỳ đâu trong ứng dụng mà không cần import chúng.

Khi chạy test, chúng ta cần làm cho component Vue Router có thể sử dụng trong component chúng ta mount. Có 2 phương thức để làm việc này

### Sử dụng stubs

```js
import { shallowMount } from '@vue/test-utils'

shallowMount(Component, {
  stubs: ['router-link', 'router-view']
})
```

### Sử dụng Vue Router với localVue

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)

shallowMount(Component, {
  localVue
})
```

### Giả lập `$route` và `$router`

Đôi lúc chúng ta muốn test một component làm gì đó với các parameter từ `$router` và `$route`. Để làm việc này, chúng ta chuyền một giá trị giả vào Vue instance

```js
import { shallowMount } from '@vue/test-utils'

const $route = {
  path: '/some/path'
}

const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})

wrapper.vm.$route.path // /some/path
```

### Vài điểm quan trọng cần nhớ

Cài đặt Vue Router sẽ thêm `$route` và `$router` như giá trị read-only trong Vue.

Nghĩa là những test trong tương lai có sử dụng giả lập `$route` hoặc `$router` sẽ fail.

Để tránh việc này, không bao giờ cài Vue Router global khi chúng ta chạy test; sử dụng `localVue` như cách ở trên.
