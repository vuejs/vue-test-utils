# 测试键盘、鼠标等其它 DOM 事件

## 触发事件

`Wrapper` 暴露了一个 `trigger` 方法。它可以用来触发 DOM 事件。

```js
const wrapper = mount(MyButton)

wrapper.trigger('click')
```

你应该注意到了，`find` 方法也会返回一个 `Wrapper`。假设 `MyComponent` 包含一个按钮，下面的代码会点击这个按钮。

```js
const wrapper = mount(MyComponent)

wrapper.find('button').trigger('click')
```

## 选项

其 `trigger` 方法接受一个可选的 `options` 对象。这个 `options` 对象里的属性会被添加到事件中。

注意其目标不能被添加到 `options` 对象中。

```js
const wrapper = mount(MyButton)

wrapper.trigger('click', { button: 0 })
```


## 鼠标点击示例

**待测试的组件**

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

**测试**

```js
import YesNoComponent from '@/components/YesNoComponent'
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

describe('点击事件', () => {
  it('在 yes 按钮上点击会调用我们的方法并附带参数 "yes"', () => {
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

## 键盘示例

**待测试的组件**

这个组件允许使用不同的按键将数量递增/递减。

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

describe('键盘事件测试', () => {
  it('默认的数量是零', () => {
    const wrapper = mount(QuantityComponent)
    expect(wrapper.vm.quantity).toBe(0)
  })

  it('上按键将数量设置为 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown.up')
    expect(wrapper.vm.quantity).toBe(1)
  })

  it('下按键将数量减 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.down')
    expect(wrapper.vm.quantity).toBe(4)
  })

  it('ESC 键将数量设置为 0', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.esc')
    expect(wrapper.vm.quantity).toBe(0)
  })

  it('魔术字符 "a" 键将数量设置为 13', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown', {
      which: 65
    })
    expect(wrapper.vm.quantity).toBe(13)
  })
})

```

**限制**

点后面的按键名 `keydown.up` 会被翻译成一个 `keyCode`。这些被支持的按键名有：

| key name | key code |
| --- | --- |
| enter | 13 |
| esc | 27 |
| tab | 9 |
| space | 32 |
| delete | 46 |
| backspace | 8 |
| insert | 45 |
| up | 38 |
| down | 40 |
| left | 37 |
| right | 39 |
| end | 35 |
| home | 36 |
| pageup | 33 |
| pagedown | 34 |

## 重要事项

Vue Test Utils 是同步触发事件。因此 `Vue.nextTick` 不是必须的。
