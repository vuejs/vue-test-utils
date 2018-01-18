# Vuex 사용하기

이번에는 `vue-test-utils`와 함께, 컴포넌트에서 Vuex를 테스트하는 방법을 알아봅니다.

## 액션 목킹하기

약간의 코드를 살펴보겠습니다.

이 컴포넌트는 테스트가 필요합니다. Vuex의 액션을 호출하고 있습니다.

``` html
<template>
    <div class="text-align-center">
      <input type="text" @input="actionInputIfTrue" />
      <button @click="actionClick()">Click</button>
    </div>
</template>

<script>
import { mapActions } from 'vuex'

export default{
  methods: {
    ...mapActions([
      'actionClick'
    ]),
    actionInputIfTrue: function actionInputIfTrue (event) {
      const inputValue = event.target.value
      if (inputValue === 'input') {
        this.$store.dispatch('actionInput', { inputValue })
      }
    }
  }
}
</script>
```

이 테스트의 목적을 위해서 액션(action)이 무엇인지, 또는 스토어(store)가 어떻게 구성 되어 있는지 신경 쓸 필요가 없습니다. 우리는 단지 액션이 필요할 때 호출되고 있으며, 기대한 값으로 호출된 것을 확인해야합니다.

이 테스트에서 얕은(shallow) 스토어에 목킹된 스토어를 전달해야합니다.

저장소를 베이스 Vue 생성자에 전달하는 대신 [localVue](../api/options.md#localvue)에 전달할 수 있습니다. localVue는 글로벌 Vue 생성자에 영향을 미치지 않고, 변경할 수 있는 범위가 지정된 Vue 생성자입니다.

어떻게 구성되었는지 보겠습니다.

``` js
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Actions from '../../../src/components/Actions'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Actions.vue', () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      actionClick: jest.fn(),
      actionInput: jest.fn()
    }
    store = new Vuex.Store({
      state: {},
      actions
    })
  })

  it('calls store action actionInput when input value is input and an input event is fired', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'input'
    input.trigger('input')
    expect(actions.actionInput).toHaveBeenCalled()
  })

  it('does not call store action actionInput when input value is not input and an input event is fired', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'not input'
    input.trigger('input')
    expect(actions.actionInput).not.toHaveBeenCalled()
  })

  it('calls store action actionClick when button is clicked', () => {
    const wrapper = shallow(Actions, { store, localVue })
    wrapper.find('button').trigger('click')
    expect(actions.actionClick).toHaveBeenCalled()
  })
})
```

여기서 무슨일이 일어나고 있을까요? 첫째로 Vue에게 `Vue.use` 메소드로 Vuex를 사용하도록 지시합니다. 이는 `Vue.use`에 대한 래퍼일 뿐입니다.

다음 가짜 값과 함께 `Vuex.store`를 호출하여 목킹 스토어를 만듭니다. 우리가 지금 신경써야 할 액션만 전달합니다.

액션은 [jest 목킹 함수](https://facebook.github.io/jest/docs/en/mock-functions.html)입니다. 목킹 함수는 액션이 호출되었는지 아닌지를 검증하는 메소드를 제공합니다.

그런 다음, 우리는 테스트에서 액션 스텁이 예상한 시점에 호출되었는지 검증할 수 있습니다.

여기에서 이러한 스토어를 정의하는 방식이 조금 어색할 수 있습니다.

`beforeEach`를 사용하여, 각 테스트 전에 깨끗한 스토어를 보장 하도록 합니다. `beforeEach`는 각 테스트 전에 호출되는 Mocha 훅입니다. 이 테스트에서는 스토어 변수에 값을 다시 지정합니다. 이렇게 하지 않으면, 목킹 함수를 자동으로 재설정해 주어야 합니다. 물론 테스트에서 상태(state)를 바꿀 수 있습니다만, 이 방법이 다음에 진행되는 테스트들에 영향을 주지 않는 방법입니다.

테스트에서 가장 주의깊게 봐야할 부분은 **가짜 Vuex 스토어를 만든 다음, 이를 vue-test-utils**에 전달하는 것 입니다.

이제 액션을 목킹할 수 있습니다. getters를 목킹해보겠습니다.

## 게터 목킹하기


``` html
<template>
    <div>
      <p v-if="inputValue">{{inputValue}}</p>
      <p v-if="clicks">{{clicks}}</p>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default{
  computed: mapGetters([
    'clicks',
    'inputValue'
  ])
}
</script>
```

아주 간단한 컴포넌트입니다. 게터는 `clicks`와 `inputValue`의 결과를 렌더링합니다. 다시 말하지만, 우리는 단지 결과가 올바르게 렌더링 되는 것 외에 게터가 반환하는 것을 신경쓰지 않습니다.

테스트를 봅니다.

``` js
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Actions from '../../../src/components/Getters'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Getters.vue', () => {
  let getters
  let store

  beforeEach(() => {
    getters = {
      clicks: () => 2,
      inputValue: () => 'input'
    }

    store = new Vuex.Store({
      getters
    })
  })

  it('Renders state.inputValue in first p tag', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(getters.inputValue())
  })

  it('Renders state.clicks in second p tag', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const p = wrapper.findAll('p').at(1)
    expect(p.text()).toBe(getters.clicks().toString())
  })
})
```
이 테스트는 액션 테스트와 비슷합니다. 각 테스트 전에 가짜 스토어를 만들고 `shallow`를 호출 할 때 옵션을 넘겨주고, 목킹 게터에 의해 반환된 값이 렌더링 되는 것을 검증합니다.

이는 훌륭하지만, getter가 멀쩡한 상태(state)를 리턴하고 있는지 확인 하려면 어떻게 해야할까요?

## 모듈 목킹하기

[모듈](https://vuex.vuejs.org/en/modules.html)은 스토어를 관리 가능한 덩어리로 분리하는데 유용합니다. 또한 게터를 내보냅니다. 테스트에서 이 것을 사용할 수 있습니다.

컴포넌트를 살펴봅니다.

``` html
<template>
  <div>
    <button @click="moduleActionClick()">Click</button>
    <p>{{moduleClicks}}</p>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default{
  methods: {
    ...mapActions([
      'moduleActionClick'
    ])
  },

  computed: mapGetters([
    'moduleClicks'
  ])
}
</script>
```

하나의 액션과 게터를 포함하는 간단한 컴포넌트입니다.

아래는 테스트입니다.

``` js
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Modules from '../../../src/components/Modules'
import module from '../../../src/store/module'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Modules.vue', () => {
  let actions
  let state
  let store

  beforeEach(() => {
    state = {
      module: {
        clicks: 2
      }
    }

    actions = {
      moduleActionClick: jest.fn()
    }

    store = new Vuex.Store({
      state,
      actions,
      getters: module.getters
    })
  })

  it('calls store action moduleActionClick when button is clicked', () => {
    const wrapper = shallow(Modules, { store, localVue })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(actions.moduleActionClick).toHaveBeenCalled()
  })

  it('Renders state.inputValue in first p tag', () => {
    const wrapper = shallow(Modules, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(state.module.clicks.toString())
  })
})
```

### 리소스

- [이 가이드의 예제](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [localVue](../api/options.md#localvue)
- [createLocalVue](../api/createLocalVue.md)
