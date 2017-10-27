# Тестирование нажатий клавиш, мыши и других событий DOM

## Генерация событий

`Wrapper` предоставляет метод `trigger`. Его можно использовать для генерации событий DOM.

```js
const wrapper = mount(MyButton)

wrapper.trigger('click')
```

Вы должны помнить, что поиск возвращает также и wrapper. Предполагается, что `MyComponent` содержит кнопку, а следующий код нажимает эту кнопку.

```js
const wrapper = mount(MyComponent)

wrapper.find('button').trigger('click')
```

## Опции

Метод `trigger` также может опционально принимать объект `options`. Свойства объекта `options` добавятся к Event.

Вы можете запустить preventDefault для события, передав `preventDefault: true` в `options`.

```js
const wrapper = mount(MyButton)

wrapper.trigger('click', { preventDefault: true })
```


## Пример тестирования кнопки мыши

**Тестируемый компонент**

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

**Тест**

```js
import YesNoComponent from '@/components/YesNoComponent'
import { mount } from 'vue-test-utils'
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

## Пример тестирования клавиши

**Тестируемый компонент**

Этот компонент позволяет увеличивать/уменьшать количество с помощью различных клавиш.

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

**Тест**

```js
import QuantityComponent from '@/components/QuantityComponent'
import { mount } from 'vue-test-utils'

describe('Key event tests', () => {
  it('Quantity is zero by default', () => {
    const wrapper = mount(QuantityComponent)
    expect(wrapper.vm.quantity).to.equal(0)
  })

  it('Cursor up sets quantity to 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown.up')
    expect(wrapper.vm.quantity).to.equal(1)
  })

  it('Cursor down reduce quantity by 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.down')
    expect(wrapper.vm.quantity).to.equal(4)
  })

  it('Escape sets quantity to 0', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.esc')
    expect(wrapper.vm.quantity).to.equal(0)
  })

  it('Magic character "a" sets quantity to 13', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown', {
      which: 65
    })
    expect(wrapper.vm.quantity).to.equal(13)
  })
})

```

**Ограничения**

Имя модификатора после точки `keydown.up` преобразуется в `keyCode`. Это поддерживается для следующих имён:

* enter, tab, delete, esc, space, up, down, left, right

## Важно

vue-test-utils генерирует событие синхронно. Следовательно, `vue.nextTick` не требуется.