# キー、マウス、その他の DOM イベントのテスト

## イベントをトリガする

`Wrapper` の `trigger` メソッドで DOM イベントをトリガすることができます。

```js
const wrapper = mount(MyButton)

wrapper.trigger('click')
```

`find` メソッドは `mount` メソッドと同じように `Wrapper` を返します。 `MyComponent` 内に `button` があると仮定すると、以下のコードは、 `button` をクリックします。

```js
const wrapper = mount(MyComponent)

wrapper.find('button').trigger('click')
```

## オプション

`trigger` メソッドはオプションで `options` オブジェクトを引数として取ります。`options` オブジェクトのプロパティはイベントオブジェクトのプロパティに追加されます。

target を `options` オブジェクトに追加することができないことに注意してください。

```js
const wrapper = mount(MyButton)

wrapper.trigger('click', { button: 0 })
```


## マウスクリックの例

**テスト対象のコンポーネント**

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

**テスト**

```js
import YesNoComponent from '@/components/YesNoComponent'
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

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

## キーボードの例

**テスト対象のコンポーネント**

このコンポーネントはいくつかのキーを使用して `quantity` を増減することができます。

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

**テスト**

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

**制限事項**

`.` の後のキー名( `keydown.up` の場合 `up` )は `keyCode` に変換されます。以下のキー名が変換されます。

| キー名 | キーコード |
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

## 重要事項

`vue-test-utils` は同期的にイベントをトリガします。従って、 `Vue.nextTick()` を実行する必要はありません。
