# 选择器

很多方法的参数中都包含选择器。一个选择器可以是一个 CSS 选择器、一个 Vue 组件或是一个查找选项对象。

## CSS 选择器

挂载处理任何有效的 CSS 选择器：

- 标签选择器 (`div`、`foo`、`bar`)
- 类选择器 (`.foo`、`.bar`)
- 特性选择器 (`[foo]`、`[foo="bar"]`)
- id 选择器 (`#foo`、`#bar`)
- 伪选择器 (`div:first-of-type`)

你也可以结合使用：

- 直接从属结合 (`div > #bar > .foo`)
- 一般从属结合 (`div #bar .foo`)
- 近邻兄弟选择器 (`div + .foo`)
- 一般兄弟选择器 (`div ~ .foo`)

## Vue 组件

Vue 组件也是有效的选择器。

```js
// Foo.vue

export default {
  name: 'FooComponent'
}
```

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
expect(wrapper.is(Foo)).toBe(true)
```

## 查找选项对象

### Name

Vue Test Utils 允许通过一个查找选项对象在组件包裹器上根据一个组件的 `name` 选择元素。


```js
const buttonWrapper = wrapper.find({ name: 'my-button' })
buttonWrapper.trigger('click')
```

### Ref

Vue Test Utils 允许通过一个查找选项对象在组件包裹器上根据 `$ref` 选择元素。

```js
const buttonWrapper = wrapper.find({ ref: 'myButton' })
buttonWrapper.trigger('click')
```
