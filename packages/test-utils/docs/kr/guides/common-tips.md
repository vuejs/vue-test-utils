# 일반적인 팁

## 어떤것을 테스트해야 할까요

UI 컴포넌트의 경우, 내부 구현에 집중하다 보면 너무 많은 내부 구현을 살펴보아야 하기 때문에, 테스트 작성에 소홀하게 되어 나중에는 테스트가 어렵습니다. 그래서 코드 한 줄 한 줄을 모두 테스트하는 것을 추천하지 않습니다.

대신, 컴포넌트 퍼블릭 인터페이스를 확인하는 테스트를 작성하는 것을 추천합니다. 그리고 내부를 블랙박스로 취급해야 합니다. 하나의 테스트 케이스는 컴포넌트에 전달된 일부 입력 (사용자 인터렉션 또는 props 변경)이 예상되는 대로 출력(렌더링 된 결과 또는 방출된 사용자 정의 이벤트)되는지 확인 해야합니다.

예를 들어 버튼을 클릭할 때마다 카운터를 1씩 증가하는 `Counter` 컴포넌트의 경우, 해당 테스트 케이스가 클릭을 시뮬레이션하고, 렌더링 된 출력이 1씩 증가했음을 검증합니다. 이 테스트에서는 구현 방식은 생각하지 않고, 카운터의 값을 증가시키는 입력과 출력만 고려합니다.

이 접근 방식의 장점은 컴포넌트의 퍼블릭 인터페이스가 동일하게 유지되는 한 컴포넌트 내부 구현이 어떻게 변경되더라도 테스트가 통과된다는 것입니다.

이 주제는 [Matt O'Connell의 훌륭한 발표](http://slides.com/mattoconnell/deck#/)를 확인하세요

## 얕은(Shallow) 렌더링 

유닛 테스트에서, 보통 컴포넌트를 독립된 단위로 격리시켜 간접적으로 자식 컴포넌트의 동작을 실행하는 것을 피합니다.

이에 더하여, 많은 자식 컴포넌트를 가진 컴포넌트는 렌더링 된 트리 전체가 커질 수 있습니다. 반복적으로 모든 자식 컴포넌트를 렌더링하면 테스트 속도가 느려질 수 있습니다.

`vue-test-utils`는 `shallow` 메소드를 이용해 자식 컴포넌트를 렌더링하지 않고 (스텁으로) 컴포넌트를 마운트할 수 있게 합니다.

```js
import { shallow } from '@vue/test-utils'

const wrapper = shallow(Component) // 마운트된 컴포넌트 인스턴트를 포함한 래퍼를 반환
wrapper.vm // 마운트된 Vue 인스턴스
```

## 방출된 이벤트 검증

마운트된 각 래퍼는 자동으로 Vue 인스턴스에 의해 생성된 모든 이벤트를 기록합니다. `wrapper.emitted()` 메소드를 사용해 기록된 이벤트를 검색할 수 있습니다.

``` js
wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
wrapper.emitted() 는 다음 객체를 반환합니다.
{
  foo: [[], [123]]
}
*/
```

그런 다음 위 데이터 기반으로 검증할 수 있습니다.

``` js
// 방출된 이벤트 검증
expect(wrapper.emitted().foo).toBeTruthy()

// 이벤트 갯수 검증
expect(wrapper.emitted().foo.length).toBe(2)

// 이벤트 페이로드 검증
expect(wrapper.emitted().foo[1]).toEqual([123])
```

[wrapper.emittedByOrder()](../api/wrapper/emittedByOrder.md)를 호출하여 이벤트 배열을 방출될 순서대로 가져올 수 있습니다.

## 컴포넌트 상태 조작

래퍼에서 `setData` 또는 `setProps` 메소드를 사용하여 컴포넌트 상태를 직접 조작할 수 있습니다.

```js
wrapper.setData({ count: 10 })

wrapper.setProps({ foo: 'bar' })
```

## Props 목킹

Vue에 내장된 `propsData` 옵션을 이용해 컴포넌트에 props에 전달할 수 있습니다.

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  propsData: {
    aProp: 'some value'
  }
})
```

이미 마운트 된 컴포넌트의 props를 갱신하려면 `wrapper.setProps({})`을 이용합니다.

*전체 옵션은 문서의 [마운트 옵션](../api/options.md)을 확인하세요*

## 글로벌 플러그인과 믹스인 적용

일부 컴포넌트는 글로벌 플러그인 또는 믹스인에 의존한 기능이 있을 수 있습니다. 예를 들어 `vuex`와 `vue-router`가 있습니다.

특정 앱의 컴포넌트에 대한 테스트를 작성하는 경우 동일한 글로벌 플러그인과 믹스인을 테스트 항목에 한번만 설정할 수 있습니다. 그러나 일부 앱에서 공유할 수 있는 일반적인 컴포넌트들을 테스트하는 경우에는 글로벌 `Vue` 생성자를 오염시키지 않고 격리시켜 컴포넌트를 테스트하는 것이 좋습니다. [createLocalVue](../api/createLocalVue.md) 메소드를 사용해 다음과 같이 할 수 있습니다.

``` js
import { createLocalVue } from '@vue/test-utils'

// 확장된 Vue 생성자를 만듭니다.
const localVue = createLocalVue()

// 일반적으로 사용하듯 플러그인을 설치합니다.
localVue.use(MyPlugin)

// 마운트 옵션에 localVue를 전달합니다.
mount(Component, {
  localVue
})
```

## 인젝션 목킹

간단하게 모의 속성을 주입하는 또 다른 방법은, `mocks` 옵션을 이용해 목킹하면 됩니다.

```js
import { mount } from '@vue/test-utils'

const $route = {
  path: '/',
  hash: '',
  params: { id: '123' },
  query: { q: 'hello' }
}

mount(Component, {
  mocks: {
    $route // 컴포넌트를 마운트하기 전에 목킹된 $route 객체를 Vue 인스턴스에 추가합니다.
  }
})
```

## 라우팅 다루기

정의를 이용한 라우팅은 전반적인 앱 구조와 여러 컴포넌트와 관련되므로 통합 또는 엔드-투-엔드 테스트에서 가장 잘 테스트 할 수 있습니다. `vue-router` 기능에 의존하는 개별 컴포넌트의 경우, 위의 방법을 사용하여 목킹할 수 있습니다.
