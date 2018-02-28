# 마운팅 옵션

`mount`와 `shallow` 의 옵션. 옵션 객체는 `vue-test-utils` 마운트 옵션과 Vue의 기본 옵션을 모두 포함할 수 있습니다.

새 인스턴스가 만들어지면 Vue 옵션이 컴포넌트에 전달됩니다. 예를 들어 `store`, `propsData`가 있습니다. 전체 목록을 보려면 [Vue API 문서](https://vuejs.org/v2/api/)를 참조하십시오

## `vue-test-utils` 마운팅 옵션

- [context](#context)
- [slots](#slots)
- [stubs](#stubs)
- [mocks](#mocks)
- [localVue](#localvue)
- [attachToDocument](#attachtodocument)
- [attrs](#attrs)
- [listeners](#listeners)

### `context`

- 타입: `Object`

컨텍스트를 함수형 컴포넌트에 전달합니다. 함수형 컴포넌트에서만 사용할 수 있습니다.

예:

```js
const wrapper = mount(Component, {
  context: {
    props: { show: true }
  }
})

expect(wrapper.is(Component)).toBe(true)
```

### `slots`

- 타입: `{ [name: string]: Array<Component>|Component|string }`

컴포넌트에 슬롯 객체를 제공합니다. 객체의 키 이름은, 해당 슬롯 이름입니다. 이 값은 컴포넌트, 컴포넌트 배열, 템플릿 문자열 일 수 있습니다.

예:

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Component, {
  slots: {
    default: [Foo, Bar],
    fooBar: Foo, // <slot name="FooBar" /> 와 일치하는.,
    foo: '<div />'
  }
})
expect(wrapper.find('div')).toBe(true)
```

### `stubs`

- 타입: `{ [name: string]: Component | boolean } | Array<string>`

자식 컴포넌트를 스텁합니다. 스텁 또는 객체에 대한 컴포넌트 이름의 배열일 수 있습니다.

예:

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallow(Component, {
  stubs: {
    // 특정 구현을 스텁으로 한다.
    'registered-component': Foo,
    // 기본 구현을 스텁으로 생성한다.
    'another-component': true
  }
})
```

### `mocks`

- 타입: `Object`

인스턴스에 추가 특성(prop)을 추가하십시오. 글로벌 인젝션을 목킹하는데 유용합니다.

예:

```js
const $route = { path: 'http://www.example-path.com' }
const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

### `localVue`

- 타입: `Vue`

localVue는 [createLocalVue](./createLocalVue.md)에 의해 생성된 Vue의 로컬 복사본입니다. 컴포넌트를 마운트할 때, 이 Vue 복사본에 플러그인을 설치하면 `Vue` 원본을 오염시키지 않습니다.

예:

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [
  { path: '/foo', component: Foo }
]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

### `attachToDocument`

- 타입: `boolean`
- default: `false`

`true`로 설정된 경우 렌더링될 때 컴포넌트는 DOM에 연결됩니다. 이는 여러 엘리먼트를 반환하는 CSS 셀렉터를 검사하기 위해 [`hasStyle`](wrapper/hasStyle.md)와 함께 사용할 수 있습니다.

### `attrs`

- 타입: `Object`

컴포넌트 인스턴스의 `$attrs`를 설정합니다.

### `listeners`

- 타입: `Object`

컴포넌트 인스턴스의 `$listeners`를 설정합니다.
