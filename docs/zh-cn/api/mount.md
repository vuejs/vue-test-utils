# `mount(component {, options}])`

- **参数：**

  - `{Component} component`
  - `{Object} options`

- **返回值：** `{Wrapper}`

- **选项：**

移步[选项](options.md)

- **用法：**

创建一个包含被挂载和渲染的 Vue 组件的 [`Wrapper`](wrapper/README.md)。

**Without options:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**使用 Vue 选项：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.hasProp('color', 'red')).toBe(true)
  })
})
```

**固定在 DOM 上：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      attachToDocument: true
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```
**默认的和具名的插槽：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // 将匹配 `<slot name="FooBar" />`。
        foo: '<div />'
      }
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**将全局属性存根：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = mount(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```

**将组件存根：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import Faz from './Faz.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      stubs: {
        Bar: '<div class="stubbed" />',
        BarFoo: true,
        FooBar: Faz
      }
    })
    expect(wrapper.contains('.stubbed')).toBe(true)
    expect(wrapper.contains(Bar)).toBe(true)
  })
})
```

- **延伸阅读：**[`Wrapper`](wrapper/README.md)
