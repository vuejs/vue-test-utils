# Тестирование нажатий клавиш, мыши и других событий DOM

## Генерация событий

`Wrapper` предоставляет метод `trigger`. Его можно использовать для генерации событий DOM.

```js
const wrapper = mount(MyButton)

wrapper.trigger('click')
```

Вы должны помнить, что метод `find` также возвращает `Wrapper`. Предполагается, что `MyComponent` содержит кнопку, а следующий код нажимает эту кнопку.

```js
const wrapper = mount(MyComponent)

wrapper.find('button').trigger('click')
```

## Опции

Метод `trigger` также может опционально принимать объект `options`. Свойства объекта `options` добавятся к Event.

```js
const wrapper = mount(MyButton)

wrapper.trigger('click', { button: 0 })
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
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

describe('Click event', () => {
  it('Нажатие на кнопке yes вызывает наш метод с аргументом "yes"', () => {
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
import { mount } from '@vue/test-utils'

describe('Тестирование событий клавиш', () => {
  it('Quantity по умолчанию равно нулю', () => {
    const wrapper = mount(QuantityComponent)
    expect(wrapper.vm.quantity).toBe(0)
  })

  it('Клавиша вверх устанавливает quantity равным 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown.up')
    expect(wrapper.vm.quantity).toBe(1)
  })

  it('Клавиша вниз уменьшает quantity на 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.down')
    expect(wrapper.vm.quantity).toBe(4)
  })

  it('Escape устанавливает quantity равным 0', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.esc')
    expect(wrapper.vm.quantity).toBe(0)
  })

  it('Магический символ "a" устанавливает quantity равным 13', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown', {
      which: 65
    })
    expect(wrapper.vm.quantity).toBe(13)
  })
})

```

**Ограничения**

Имя модификатора после точки `keydown.up` преобразуется в `keyCode`. Это поддерживается для следующих имён:

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

## Важно

`vue-test-utils` генерирует событие синхронно. Следовательно, `Vue.nextTick` не требуется.
