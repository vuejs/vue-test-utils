# 셀렉터

많은 메소드가 셀렉터를 전달인자로 사용합니다. 셀렉터는 CSS 셀렉터, Vue 컴포넌트 또는 find 옵션 객체가 될 수 있습니다.

## CSS 셀렉터

mount는 유효한 CSS 셀렉터를 처리합니다.

- tag 셀렉터 (div, foo, bar)
- class 셀렉터 (.foo, .bar)
- attribute 셀렉터 ([foo], [foo="bar"])
- id 셀렉터 (#foo, #bar)
- pseudo 셀렉터 (div:first-of-type)

컴비네이터 또한 사용할 수 있습니다.

- direct descendant combinator (div > #bar > .foo)
- general descendant combinator (div #bar .foo)
- adjacent sibling selector (div + .foo)
- general sibling selector (div ~ .foo)

## Vue 컴포넌트

Vue 컴포넌트 또한 셀렉터로 사용할 수 있습니다.

`vue-test-utils`는 `name` 속성을 사용하여 인스턴스 트리에서 일치하는 Vue 컴포넌트를 찾습니다.

```js
// Foo.vue

export default{
  name: 'FooComponent'
}
```

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
expect(wrapper.is(Foo)).toBe(true)
```

## 옵션 오브젝트 찾기

### Ref

find 옵션 객체를 사용해 `vue-test-utils`는 래퍼 컴포넌트에서 $ref로 엘리먼트를 셀렉트할 수 있습니다.

```js
const buttonWrapper = wrapper.find({ ref: 'myButton' })
buttonWrapper.trigger('click')
```
