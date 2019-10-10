# Sử dụng với Vuex

Trong phần hướng dẫn này, chúng ta sẽ xem cách để test Vuex trong component với Vue Test Utils, và cách tiếp cận với test một Vuex store

## Test Vuex trong component

### Giả lập Action

Xem code ví dụ

Đây là component chúng ta muốn test. Nó gọi action của Vuex.

```html
<template>
  <div class="text-align-center">
    <input type="text" @input="actionInputIfTrue" />
    <button @click="actionClick()">Click</button>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    methods: {
      ...mapActions(['actionClick']),
      actionInputIfTrue: function actionInputIfTrue(event) {
        const inputValue = event.target.value
        if (inputValue === 'input') {
          this.$store.dispatch('actionInput', { inputValue })
        }
      }
    }
  }
</script>
```

Với mục đích của test này, chúng ta không quan tâm action làm gì, hoặc store sẽ như thế này. Chúng ta chỉ cần biết action đó có được gọi khi cần không và được gọi với giá trị như expect.

Để test cái này, chúng ta cần truyền một store giả lập vào trong Vue khi chúng `shallowMount` component.

Thay vì truyền store vào trong Vue constructor, chúng ta chuyền nó trong một [localVue](../api/options.md#localvue). `localValue` có chung scope với Vue constructor, chúng ta không cần đá động tới global Vue constructor

Code sẽ như thế này:

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
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
      actions
    })
  })

  it('dispatches "actionInput" when input event value is "input"', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'input'
    input.trigger('input')
    expect(actions.actionInput).toHaveBeenCalled()
  })

  it('does not dispatch "actionInput" when event value is not "input"', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'not input'
    input.trigger('input')
    expect(actions.actionInput).not.toHaveBeenCalled()
  })

  it('calls store action "actionClick" when button is clicked', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    wrapper.find('button').trigger('click')
    expect(actions.actionClick).toHaveBeenCalled()
  })
})
```

Chuyện gì đang diễn ra ở đây? Trước ta chúng ta nói với Vue sử dụng Vuex với phương thức `localVue.use`. Đây là một wrapper của `Vue.use`

Khi chúng ta giả lập store bằng cách gọi `new Vuex.Store` với giá trị giả lập. Chúng ta chỉ truyền vào đó action, bởi vì đó là những gì chúng ta quan tâm.

Những action này là [hàm giả lập của jest](https://jestjs.io/docs/en/mock-functions.html). Các hàm giả lập này cho phép chúng ta xác nhận là hàm đã được gọi hay chưa.

Chúng ta có thể xác nhận trong test action này đã được gọi khi cần.

Cách chúng ta khai báo store có thể hơi lạ.

Chúng ta sử dụng `beforeEach` để đảm bảo chúng ta có một store _sạch_, không có bất cứ gì trước khi test. `beforeEach` là một hàm hook có sẵn sẽ chạy trước khi mỗi lần chạy test. Trong test của chúng ta, chúng ta gán lại giá trị của biến store. Nếu không làm vậy, các hàm giả lập cần tự động reset. Nó cũng cho phép chúng ta thay đổi trạng thái của test mà không ảnh hưởng đến các test khác.

Điều quan trọng nhất cần lưu ý ở test này là **chúng ta tạo ra một Vuex store giả lập và sau đó truyền vào cho Vue Test Utils**.

Tuyệt vời, giờ chúng ta đã có các action giả lập, xem tiếp cách giả lập getter.

### Giả lập Getter

```html
<template>
  <div>
    <p v-if="inputValue">{{inputValue}}</p>
    <p v-if="clicks">{{clicks}}</p>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    computed: mapGetters(['clicks', 'inputValue'])
  }
</script>
```

Đây là một component khá đơn giản. Nó render kết quả của getter `clicks` và `inputValue`. Một lần nữa, chúng ta không quan tâm giá trị trả về của getter - chỉ quan tâm kết quả render ra đúng.

Xem phần test:

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Getters from '../../../src/components/Getters'

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

  it('Renders "store.getters.inputValue" in first p tag', () => {
    const wrapper = shallowMount(Getters, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(getters.inputValue())
  })

  it('Renders "store.getters.clicks" in second p tag', () => {
    const wrapper = shallowMount(Getters, { store, localVue })
    const p = wrapper.findAll('p').at(1)
    expect(p.text()).toBe(getters.clicks().toString())
  })
})
```

Test này khá giống với action test ở trên. Chúng ta tạo ra store giả lập trước mỗi test, truyền vào đó một option khi chúng ta gọi `shallowMount`, và xác nhận giá trị trả về bởi các getter giả lập được render.

Tuyệt, vậy nếu như chúng ta muốn kiểm tra getter có trả về đúng giá trị trong state không?

### Giả lập với Module

[Module](https://vuex.vuejs.org/guide/modules.html) rất hữu dụng để chia store ra thành nhiều phần riêng biệt. Chúng ta đồng thời cũng export getter. Chúng ta có thể sử dụng trong test

Xem component của chúng ta:

```html
<template>
  <div>
    <button @click="moduleActionClick()">Click</button>
    <p>{{moduleClicks}}</p>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  export default {
    methods: {
      ...mapActions(['moduleActionClick'])
    },

    computed: mapGetters(['moduleClicks'])
  }
</script>
```

Một component đơn giản bao gồm một action và một getter.

Và test:

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import MyComponent from '../../../src/components/MyComponent'
import myModule from '../../../src/store/myModule'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('MyComponent.vue', () => {
  let actions
  let state
  let store

  beforeEach(() => {
    state = {
      clicks: 2
    }

    actions = {
      moduleActionClick: jest.fn()
    }

    store = new Vuex.Store({
      modules: {
        myModule: {
          state,
          actions,
          getters: myModule.getters
        }
      }
    })
  })

  it('calls store action "moduleActionClick" when button is clicked', () => {
    const wrapper = shallowMount(MyComponent, { store, localVue })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(actions.moduleActionClick).toHaveBeenCalled()
  })

  it('renders "state.clicks" in first p tag', () => {
    const wrapper = shallowMount(MyComponent, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(state.clicks.toString())
  })
})
```

### Test một Vuex Store

Có 2 cách tiếp cận để test Vuex store. Cách đầu tiên là unit test getter, mutation, và action riêng biệt. Cách tiếp tiếp cận thứ 2 là tạo một store và test toàn bộ. Chúng ta sẽ xem qua cả 2 cách.

Để xem làm thế nào test Vuex store, chúng ta tạo một store counter đơn giản. Store sẽ có một mutation `increment` và một getter `evenOrOdd`

```js
// mutations.js
export default {
  increment(state) {
    state.count++
  }
}
```

```js
// getters.js
export default {
  evenOrOdd: state => (state.count % 2 === 0 ? 'even' : 'odd')
}
```

### Test getter, mutation, và action riêng biệt

Getter, mutation, và action đều là các function javascript, vậy nên chúng ta có thể test chúng mà không cần sử dụng Vue Test Utils và Vuex

Lợi ích của việc test getter, mutation, action riêng biệt là unit test rất chi tiết. Khi chúng fail, chúng ta có thể biết được chính xác code sai chỗ nào. Mặc hạn chế của nó là bạn phải giả lập Vuex function, như `commit` và `dispatch`. Nó có thể dẫn tới trường hợp khi unit test pass, nhưng production sẽ fail vì hàm giả lập không chính xác.

Chúng ta sẽ tạo ra 2 file test, `mutations.spec.js` và `getters.spec.js`:

Trước tiên, test mutation `increment`

```js
// mutations.spec.js

import mutations from './mutations'

test('"increment" increments "state.count" by 1', () => {
  const state = {
    count: 0
  }
  mutations.increment(state)
  expect(state.count).toBe(1)
})
```

Giờ test getter `evenOrOdd`. Chúng ta có thể test nó bằng cách tạo state giả lập, gọi getter với `state` và kiểm tra giá trị trở về.

```js
// getters.spec.js

import getters from './getters'

test('"evenOrOdd" returns even if "state.count" is even', () => {
  const state = {
    count: 2
  }
  expect(getters.evenOrOdd(state)).toBe('even')
})

test('"evenOrOdd" returns odd if "state.count" is odd', () => {
  const state = {
    count: 1
  }
  expect(getters.evenOrOdd(state)).toBe('odd')
})
```

### Test toàn bộ store

Cách tiếp cận khác để test một Vuex store là khởi tạo một store với những config và test trên store này.

Lợi ích của khởi tạo một store instance là chúng ta không cần các hàm giả lập Vuex.

Hạn chế là nếu test fail, rất khó để xác định vấn đề ở đâu.

Viết test thôi. Chúng ta sẽ tạo một store, chúng ta sẽ sử dụng `localVue` để tránh ảnh hưởng đến Vue constructor. Test sử dụng store config được export bên trong `store-config.js`

```js
// store-config.js

import mutations from './mutations'
import getters from './getters'

export default {
  state: {
    count: 0
  },
  mutations,
  getters
}
```

```js
// store-config.spec.js

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import storeConfig from './store-config'
import { cloneDeep } from 'lodash'

test('increments "count" value when "increment" is commited', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store(cloneDeep(storeConfig))
  expect(store.state.count).toBe(0)
  store.commit('increment')
  expect(store.state.count).toBe(1)
})

test('updates "evenOrOdd" getter when "increment" is commited', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store(cloneDeep(storeConfig))
  expect(store.getters.evenOrOdd).toBe('even')
  store.commit('increment')
  expect(store.getters.evenOrOdd).toBe('odd')
})
```

Để ý là chúng ta sử dụng `cloneDeep` để clone một store config trước khi tạo store. Với vì Vuex sẽ có thể mutate object option. Để đảm bảo store _sạch_ trong mọi test, chúng clone nó thành `storeConfig`.

### Tham khảo

- [Project ví dụ để test component](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [Project ví dụ để test store](https://github.com/eddyerburgh/testing-vuex-store-example)
- [`localVue`](../api/options.md#localvue)
- [`createLocalVue`](../api/createLocalVue.md)
