# Testando mouse, teclas e outros eventos do DOM

## Desencadear eventos

O wrapper (wrapper) expõe o método `trigger`. Ele pode ser usado para desencadear eventos do DOM.

```js
const wrapper = mount(MeuBotao)

wrapper.trigger('click')
```

Você deve estar ciente que esse método também retorna um wrapper. Assumindo que em `MeuComponente` há um botão, o código a seguir simula o clique no botão.

```js
const wrapper = mount(MeuComponente)

wrapper.find('button').trigger('click')
```

## Opções

O método `trigger` pode receber um objeto `options` opcional. As propriedades no objeto `options` serão adicionadas no evento.

```js
const wrapper = mount(MeuBotao)

wrapper.trigger('click', { button: 0 })
```

## Exemplo de clique no mouse

**Componente que será testado**

```html
<template>
<div>
  <button class="sim" @click="chamaSim">Sim</button>
  <button class="nao" @click="chamaNao">Não</button>
</div>
</template>
<script>
export default {
  name: 'SimNaoComponente',
  props: {
    meLigou: {
      type: Function
    }
  },
  methods: {
    chamaSim() {
      this.meLigou('sim')
    },
    chamaNao() {
      this.meLigou('não')
    }
  }
}
</script>

```

**Teste**

```js
import SimNaoComponente from '@/componentes/SimNaoComponente'
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

describe('Evento de clique', () => {
  it('Clieque no botão sim chama o método com o argumento "sim"', () => {
    const spy = sinon.spy()
    const wrapper = mount(SimNaoComponente, {
      propsData: {
        meLigou: spy
      }
    })
    wrapper.find('button.sim').trigger('click')

    spy.should.have.been.calledWith('sim')
  })
})
```

## Exemplo do teclado

**Componente a ser testado**

Esse componente permite incrementar ou decrementar o contador usando várias teclas do teclado.

```html
<template>
<input type="text" @keydown.prevent="tocouTecla" v-model="contador" />
</template>
<script>
const BAIXO = 40
const CIMA = 38
const ESC = 27
const A = 65

export default {
  name: 'ContadorComponente',
  data() {
    return {
      contador: 0
    }
  },
  methods: {
    incrementa() {
      this.contador += 1
    },
    decrementa() {
      this.contador -= 1
    },
    zerar() {
      this.contador = 0
    },
    tocouTecla(e) {
      if (e.keyCode === ESC) {
        this.clear()
      }
      if (e.keyCode === BAIXO) {
        this.decrementa()
      }
      if (e.keyCode === CIMA) {
        this.incrementa()
      }
      if (e.which === A) {
        this.contador = 13
      }
    }
  },
  watch: {
    contador: function (novoValor) {
      this.$emit('entrada', novoValor)
    }
  }
}
</script>

```

**Test**

```js
import ContadorComponente from '@/componentes/ContadorComponente'
import { mount } from '@vue/test-utils'

describe('Testes de eventos de tecla', () => {
  it('Contador é zero por padrão', () => {
    const wrapper = mount(ContadorComponente)
    expect(wrapper.vm.contador).toBe(0)
  })

  it('Tecla para cima incrementa contador para um', () => {
    const wrapper = mount(ContadorComponente)
    wrapper.trigger('keydown.up')
    expect(wrapper.vm.contador).toBe(1)
  })

  it('Tecla para baixo decrementa contador para quatro', () => {
    const wrapper = mount(ContadorComponente)
    wrapper.vm.contador = 5
    wrapper.trigger('keydown.down')
    expect(wrapper.vm.contador).toBe(4)
  })

  it('Tecla esc volta o contador para zero', () => {
    const wrapper = mount(ContadorComponente)
    wrapper.vm.contador = 5
    wrapper.trigger('keydown.esc')
    expect(wrapper.vm.contador).toBe(0)
  })

  it('Tecla A define o contador para 13', () => {
    const wrapper = mount(ContadorComponente)
    wrapper.trigger('keydown', {
      which: 65
    })
    expect(wrapper.vm.contador).toBe(13)
  })
})

```

**Limitações**

O nome da tecla depois do ponto em `keydown.up` é traduzido para o `keyCode`. Isso é suportado para os seguintes nomes:

* enter, tab, delete, esc, space, up, down, left, right

## Importante

vue-test-utils desencadeia eventos de forma síncrona. Consequentemente, o uso do `vue.nextTick` não é necessário.
