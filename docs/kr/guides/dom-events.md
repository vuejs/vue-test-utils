# 마우스, 키 그리고 기타 DOM 이벤트 테스팅

## 이벤트 트리거

`Wrapper`는 `trigger` 메소드를 노출합니다. 이 메소드로 DOM 이벤트를 트리거(발생하게)합니다.

```js
const wrapper = mount(MyButton)

wrapper.trigger('click')
```

`find`를 이용하면, 리턴값이 래퍼가 돌아온다는 것을 알고 있어야 합니다. `MyComponent`속에 버튼이 포함되어 있다고 가정하면 다음 코드가 버튼을 클릭을 발생시킵니다.

```js
const wrapper = mount(MyComponent)

wrapper.find('button').trigger('click')
```

## 옵션

트리거 메소드는 선택적으로 `options` 객체를 가질 수 있습니다. 이 `options` 객체의 속성이 이벤트에 추가됩니다.

```js
const wrapper = mount(MyButton)

wrapper.trigger('click', { button: 0 })
```


## 마우스 클릭 예제

**테스트할 컴포넌트**

```html
<template>
<div>
  <button class="yes" @click="callYes">Yes</button>
  <button class="no" @click="callNo">No</button>
</div>
</template>
<script>
export default {
  name: 'YesNoComponent',
  props: {
    callMe: {
      type: Function
    }
  },
  methods: {
    callYes() {
      this.callMe('yes')
    },
    callNo() {
      this.callMe('no')
    }
  }
}
</script>

```

**테스트**

```js
import YesNoComponent from '@/components/YesNoComponent'
import { mount } from '@vue/test-utils'
import sinon from 'sinon' // sinon.js

describe('Click event', () => {
  it('Click on yes button calls our method with argument "yes"', () => {
    const spy = sinon.spy()
    const wrapper = mount(YesNoComponent, {
      propsData: {
        callMe: spy
      }
    })
    wrapper.find('button.yes').trigger('click')

    spy.should.have.been.calledWith('yes')
  })
})
```

## 키보드 예제

**테스트할 컴포넌트**

이 컴포넌트는 다양한 키조작으로 증감을 처리합니다.

```html
<template>
<input type="text" @keydown.prevent="onKeydown" v-model="quantity" />
</template>
<script>
const KEY_DOWN = 40
const KEY_UP = 38
const ESCAPE = 27
const CHAR_A = 65

export default {
  data() {
    return {
      quantity: 0
    }
  },
  methods: {
    increment() {
      this.quantity += 1
    },
    decrement() {
      this.quantity -= 1
    },
    clear() {
      this.quantity = 0
    },
    onKeydown(e) {
      if (e.keyCode === ESCAPE) {
        this.clear()
      }
      if (e.keyCode === KEY_DOWN) {
        this.decrement()
      }
      if (e.keyCode === KEY_UP) {
        this.increment()
      }
      if (e.which === CHAR_A) {
        this.quantity = 13
      }
    }
  },
  watch: {
    quantity: function (newValue) {
      this.$emit('input', newValue)
    }
  }
}
</script>

```

**Test**

```js
import QuantityComponent from '@/components/QuantityComponent'
import { mount } from '@vue/test-utils'

describe('Key event tests', () => {
  it('Quantity is zero by default', () => {
    const wrapper = mount(QuantityComponent)
    expect(wrapper.vm.quantity).toBe(0)
  })

  it('Cursor up sets quantity to 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown.up')
    expect(wrapper.vm.quantity).toBe(1)
  })

  it('Cursor down reduce quantity by 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.down')
    expect(wrapper.vm.quantity).toBe(4)
  })

  it('Escape sets quantity to 0', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.esc')
    expect(wrapper.vm.quantity).toBe(0)
  })

  it('Magic character "a" sets quantity to 13', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown', {
      which: 65
    })
    expect(wrapper.vm.quantity).toBe(13)
  })
})

```

**제한 사항**

`keydown.up` 처럼, 점 뒤에 있는 키 이름은 `keyCode`로 반환됩니다. 현재 다음 이름들만 지원하고 있습니다.

* enter, tab, delete, esc, space, up, down, left, right

## 중요

vue-test-utils는 이벤트를 동기적으로 트리거 합니다. 따라서, `Vue.nextTick`은 필요하지 않습니다.
