# `shallow(component {, options}])`

- **参数：**

  - `{Component} component`
  - `{Object} options`
    - `{boolean} attachToDocument`
    - `{Object} context`
      - `{Array<Component|Object>|Component} children`
    - `{Object} slots`
        - `{Array<Componet|Object>|Component|String} default`
        - `{Array<Componet|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<string>} stubs`
    - `{Vue} localVue`

- **返回值：**`{Wrapper}`

- **选项：**

移步[选项](./options.md)

- **用法：**

和 [`mount`](mount.md) 一样，创建一个包含被挂载和渲染的 Vue 组件的 [`Wrapper`](wrapper/README.md)，不同的是被存根的子组件。

**无选项：**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('返回一个 div', () => {
    const wrapper = shallow(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**使用 Vue 选项：**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('渲染一个 div', () => {
    const wrapper = shallow(Foo, {
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
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('渲染一个 div', () => {
    const wrapper = shallow(Foo, {
      attachToDocument: true
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**默认的和具名的插槽：**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Will match <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.find('div')).toBe(true)
  })
})
```

**将全局属性存根：**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = shallow(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```
