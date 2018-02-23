# Vue Router 사용하기

## 테스트에 Vue Router 설치

테스트 할때 Vue 기반 생성자에 Vue Router를 설치하면 안됩니다. Vue Router를 설치하면 Vue prototype에 읽기 전용 속성으로 `$route`, `$router`가 추가됩니다.

이를 피하기 위해, localVue를 만들고 여기에 Vue Router를 설치합니다.

```js
import VueRouter from 'vue-router'
const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter()

shallow(Component, {
  localVue,
  router
})
```

## `router-link` 또는`router-view`를 사용하는 테스트 컴포넌트

Vue Router를 설치하면 `router-link`와 `router-view` 컴포넌트가 등록됩니다. 즉, 임포트할 필요 없이 앱 어디서나 사용할 수 있습니다.

테스트를 실행할 때 컴포넌트에서 vue-router 관련 컴포넌트를 사용할 수 있도록 해야합니다. 이 방법에는 두가지가 있습니다.

### 스텁 사용하기

```js
shallow(Component, {
  stubs: ['router-link', 'router-view']
})
```

### localVue에 Vue Router 설치

```js
import VueRouter from 'vue-router'
const localVue = createLocalVue()

localVue.use(VueRouter)

shallow(Component, {
  localVue
})
```

## `$route`와 `$router` 목킹

때로는 컴포넌트가 `$route`와 `$router` 객체의 매개변수로 무언가를 수행하고 있는지 테스트를 할 필요가 있습니다. 이를 위해 사용자 정의 목(mocks-가짜데이터)을 Vue 인스턴스에 전달해야합니다.

```js
const $route = {
  path: '/some/path'
}

const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})

wrapper.vm.$router // /some/path
```

## 공통적으로 확인 할 주의사항

Vue Router를 설치하면 Vue prototype에 읽기 전용 속성으로 `$route`, `$router`가 추가됩니다.

이는 `$route` 또는 `$router`를 목킹하려고 시도하는 모든 테스트가 실패하는 것을 의미합니다.

이를 피하려면, 테스트를 실행하는 동안에는 Vue Router를 설치하지 마십시오.
