# 시작하기

## 설치

`vue-test-utils`를 빠르게 맛보려면 제공하는 기본적인 설정이 되어있는 데모 저장소를 클론하세요.


``` bash
git clone https://github.com/vuejs/vue-test-utils-getting-started
cd vue-test-utils-getting-started
npm install
```

프로젝트에 포함된 간단한 예제 컴포넌트인 `counter.js`를 볼 수 있습니다.

```js
// counter.js

export default {
  template: `
    <div>
      <span class="count">{{ count }}</span>
      <button @click="increment">Increment</button>
    </div>
  `,

  data () {
    return {
      count: 0
    }
  },

  methods: {
    increment () {
      this.count++
    }
  }
}
```

### 컴포넌트 마운팅

`vue-test-utils`는 Vue Component를 독립적으로 마운팅하고, 필요한 것들(props, injections, 사용자 이벤트)을 목킹(mocking)할 수 있고 결과(렌더링된 결과, 방출된 커스텀 이벤트)를 검증할 수 있습니다.

마운트된 컴포넌트는 [Wrapper](./api/wrapper.md) 내부에 반환됩니다. 래퍼는 컴포넌트 내부를 조회, 탐색, 조작 등을 할 수 있는 여러가지 유용한 메소드 지원합니다.

래퍼를 만들기 위해 `mount` 메소드를 사용합니다. 이제, `test.js` 파일을 만드세요

```js
// test.js

// mount() 메소드를 테스트 유틸에서 임포트합니다.
// 그리고 테스트할 컴포넌트를 가져옵니다.

import { mount } from '@vue/test-utils'
import Counter from './counter'

// 컴포넌트를 마운트하여 래퍼를 얻습니다.
const wrapper = mount(Counter)

// 실제 Vue 인스턴스는 wrapper.vm로 접근할 수 있습니다.
const vm = wrapper.vm

// 콘솔 로그를 사용해 래퍼의 내부를 살펴볼 수 있습니다.
// 이제 vue-test-utils와 함께 모험을 시작하세요
console.log(wrapper)
```

### 컴포넌트에서 렌더링 된 HTML 출력 테스트

래퍼를 얻었으니 처음으로 할 일은 컴포넌트가 렌더링한 HTML이 예상하는 것과 같은지 살펴봅니다.

```js
import { mount } from '@vue/test-utils'
import Counter from './counter'

describe('Counter', () => {
  // 컴포넌트를 마운트하여 래퍼를 얻습니다.
  const wrapper = mount(Counter)

  it('renders the correct markup', () => {
    expect(wrapper.html()).toContain('<span class="count">0</span>')
  })

  // 엘리먼트 유무를 확인하는 것도 쉽습니다.
  it('has a button', () => {
    expect(wrapper.contains('button')).toBe(true)
  })
})
```

`npm test`를 실행하면 테스트를 통과한 것을 볼 수 있습니다.

### 사용자 조작 시뮬레이션

우리의 카운터는 사용자가 버튼을 누르면 증가해야합니다. 이 행동을 시뮬레이션 하려면, 가장 먼저 `wrapper.find()`를 사용 해 버튼의 위치를 찾아야 합니다. 그러면 **버튼 엘리먼트의 래퍼**를 반환합니다. `.trigger()`를 이용하여 버튼 클릭을 시뮬레이션 합니다.

```js
it('button click should increment the count', () => {
  expect(wrapper.vm.count).toBe(0)
  const button = wrapper.find('button')
  button.trigger('click')
  expect(wrapper.vm.count).toBe(1)
})
```

### `nextTick`은 어떻게 할까요?

Vue는 DOM 업데이트를 미루고 비동기적으로 한번에 배치 처리하기 때문에, 여러번의 데이터 변이로 발생하는 불필요한 재 렌더링을 방지합니다. 실제로 상태가 변경된 후, Vue는 실제 DOM을 갱신을 미루고 기다리고 있습니다. 따라서 `Vue.nextTick`을 사용하지 않으면 처리 순서에 따라 업데이트 된 데이터를 바로 볼 수 없습니다.

하지만 테스트를 쉽게 하기 위해 `vue-test-utils`는 모든 업데이트를 동기적으로 반영하므로, DOM 업데이트가 반영되는것을 기다리기 위해 `Vue.nextTick`을 사용할 필요가 없습니다.

*주의: 비동기 콜백이나 Promise같은 작업을 위해, 명시적으로 이벤트 루프를 이용해야할 경우, 아직은 `nextTick`이 필요합니다.*

만약 당신이 테스트 파일에서 `nextTick`를 사용하는 하는 경우, 프로미스 내부에서 발생하는 오류는 테스트 러너가 잡아낼 수 없다는 것을 알아둬야 합니다.

이걸 피하려면, 두가지 접근방법이 있습니다. 테스트를 시작할 때, `done`콜백을 전역 에러 핸들러로 감싸거나, 인자가 없는 `nextTick`을 호출해서 프로미스로 리턴받을 수 있습니다.:

```js
// 테스트에 잡히지 않는 경우.
it('잡아내지 못하고 지나갑니다.', (done) => {
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

// 테스트가 되는 두가지 케이스.
it('done을 이용해서 에러를 잡을 것 입니다.', (done) => {
  Vue.config.errorHandler = done
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

it('프로미스를 이용해서 오류를 잡을 것 입니다.', () => {
  return Vue.nextTick()
    .then(function () {
      expect(true).toBe(false)
    })
})
```


## 앞으로 해야할 일은

- [테스트 러너 선택]하고 `vue-test-utils`을 프로젝트에 추가하세요
- [테스트를 작성하는데 필요한 기본적인 테크닉](./common-tips.md)을 살펴보세요
