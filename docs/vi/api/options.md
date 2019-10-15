# Option lúc mount

Các option cho lúc `mount` và `shallowMount`.

:::Gợi ý
Bên cạnh những option được liệt kê bên dưới, `options` có thể chứa tất cả những option nào có thể truyền vào cho `new Vue ({ /*options here*/ })`.

Những option này sẽ được trộn lại với các option của component khi mount với `mount` / `shallowMount`

[Xem các option ví dụ](#other-options)
:::

- [`context`](#context)
- [`slots`](#slots)
- [`scopedSlots`](#scopedslots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachToDocument`](#attachtodocument)
- [`propsData`](#propsdata)
- [`attrs`](#attrs)
- [`listeners`](#listeners)
- [`parentComponent`](#parentcomponent)
- [`provide`](#provide)
- [`sync`](#sync)

## context

- kiểu: `Object`

Truyền context cho functional component. Chỉ có thể sử dụng với [functional components](https://vuejs.org/v2/guide/render-function.html#Functional-Components).

Ví dụ:

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Component, {
  context: {
    props: { show: true },
    children: [Foo, Bar]
  }
})

expect(wrapper.is(Component)).toBe(true)
```

## slots

- kiểu: `{ [name: string]: Array<Component>|Component|string }`

Cung cấp một object cho slot của component. Key phải khớp với slot name. Giá trị có thể là một component, một array component, một template string hoặc text.

Ví dụ:

```js
import Foo from './Foo.vue'

const bazComponent = {
  name: 'baz-component',
  template: '<p>baz</p>'
}

const wrapper = shallowMount(Component, {
  slots: {
    default: [Foo, '<my-component />', 'text'],
    fooBar: Foo, // Will match `<slot name="FooBar" />`.
    foo: '<div />',
    bar: 'bar',
    baz: bazComponent,
    qux: '<my-component />'
  }
})

expect(wrapper.find('div')).toBe(true)
```

## scopedSlots

- kiểu: `{ [name: string]: string|Function }`

Cung cấp một object cho slot của component. Key phải khớp với slot name.

Bạn có thể đặt tên của prop sử dụng thuộc tính slot-scope:

```js
shallowMount(Component, {
  scopedSlots: {
    foo: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
  }
})
```

Thêm vào đó, prop có thể được truy xuất qua `props` khi sử dụng slot:

```js
shallowMount(Component, {
  scopedSlots: {
    default: '<p>{{props.index}},{{props.text}}</p>'
  }
})
```

Bạn cũng có thể truyền vào một function nhận prop như là một tham số:

```js
shallowMount(Component, {
  scopedSlots: {
    foo: function(props) {
      return this.$createElement('div', props.index)
    }
  }
})
```

Hoặc bạn có thể sử dụng JSX. Nếu viết JSX trong một phương thức, `this.$createElement` được tự động nhúng vào bởi babel-plugin-transform-vue-jsx:

```js
shallowMount(Component, {
  scopedSlots: {
    foo(props) {
      return <div>{props.text}</div>
    }
  }
})
```

## stubs

- kiểu: `{ [name: string]: Component | boolean } | Array<string>`

Làm một component con. Có thể truyền vào một array component, hoặc một object. Nếu `stubs` là một Array, tất cả stub sẽ là `<${component name}-stub>`.

Ví dụ:

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallowMount(Component, {
  stubs: {
    // stub with a specific implementation
    'registered-component': Foo,
    // create default stub.
    // the component name of default stub is another-component in this case.
    // the default stub is <${the component name of default stub}-stub>.
    'another-component': true
  }
})
```

## mocks

- kiểu: `Object`

Các property khác của instance. Có thể dùng để giả lập các global injection.

Ví dụ:

```js
const $route = { path: 'http://www.example-path.com' }
const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

## localVue

- kiểu: `Vue`

Một bạn sao cục bổ của Vue được tạo bởi [`createLocalVue`](./createLocalVue.md) dùng khi component đang mount. Cài đặt các plugin trên bản sao của `Vue` để tránh đụng độ với các plugin trên bản gốc.

Ví dụ:

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [{ path: '/foo', component: Foo }]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

## attachToDocument

- kiểu: `boolean`
- mặc định: `false`

Component sẽ gắn vào DOM khi đã render nếu được đặt là `true`.

Khi gắn vào DOM, bạn có thể gọi `wrapper.destroy()` ở cuối test để xóa element đã render từ document và xóa khỏi instance.

## attrs

- kiểu: `Object`

Đặt object `$attrs` của instance component.

## propsData

- kiểu: `Object`

Đặt prop cho instance component khi component đã được mount.

Ví dụ:

```js
const Component = {
  template: '<div>{{ msg }}</div>',
  props: ['msg']
}
const wrapper = mount(Component, {
  propsData: {
    msg: 'aBC'
  }
})
expect(wrapper.text()).toBe('aBC')
```

::: Gợi ý
Điểm đáng lưu ý là `propsData` sự thực là [Vue API](https://vuejs.org/v2/api/#propsData), không phải của Vue Test Utils. Nó được tiến hành thông qua [`extends`](https://vuejs.org/v2/api/#extends).
Xem [Các option khác](#other-options).
:::

## listeners

- kiểu: `Object`

Đặt object `$listeners` cho instance component.

## parentComponent

- kiểu: `Object`

Component dùng như parent của component được mount.

Ví dụ:

```js
import Foo from './Foo.vue'

const wrapper = shallowMount(Component, {
  parentComponent: Foo
})
expect(wrapper.vm.$parent.$options.name).toBe('foo')
```

## provide

- kiểu: `Object`

Truyền các property để chèn vào component. Xem [provide/inject](https://vuejs.org/v2/api/#provide-inject).

Ví dụ:

```js
const Component = {
  inject: ['foo'],
  template: '<div>{{this.foo()}}</div>'
}

const wrapper = shallowMount(Component, {
  provide: {
    foo() {
      return 'fooValue'
    }
  }
})

expect(wrapper.text()).toBe('fooValue')
```

## sync

- kiểu: `boolean`
- mặc định: `true`

Khi `sync` là `true`, Vue component sẽ được render tuần tự.

Khi `sync` là `false`, Vue component sẽ được render bất tuần tự

## Các tùy chọn khác

Khi option cho `mount` và `shallowMount` chứa các option khác, nó sẽ được ghi đè sử dụng [extends](https://vuejs.org/v2/api/#extends).

```js
const Component = {
  template: '<div>{{ foo() }}{{ bar() }}{{ baz() }}</div>',
  methods: {
    foo() {
      return 'a'
    },
    bar() {
      return 'b'
    }
  }
}
const options = {
  methods: {
    bar() {
      return 'B'
    },
    baz() {
      return 'C'
    }
  }
}
const wrapper = mount(Component, options)
expect(wrapper.text()).toBe('aBC')
```
