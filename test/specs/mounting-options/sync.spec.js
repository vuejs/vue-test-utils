import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('options.sync', (mountingMethod) => {
  it('sets watchers to sync if set to true', () => {
    const TestComponent = {
      template: '<div>{{someData}}</div>',
      data: () => ({
        someData: 'hello'
      })
    }
    const wrapper = mountingMethod(TestComponent, {
      sync: true
    })

    expect(wrapper.text()).to.equal('hello')
    wrapper.vm.someData = 'world'
    expect(wrapper.text()).to.equal('world')
    expect(wrapper.options.sync).to.equal(true)
  })

  it('sets watchers to sync if undefined', () => {
    const TestComponent = {
      template: '<div>{{someData}}</div>',
      data: () => ({
        someData: 'hello'
      })
    }
    const wrapper = mountingMethod(TestComponent)

    expect(wrapper.text()).to.equal('hello')
    wrapper.vm.someData = 'world'
    expect(wrapper.text()).to.equal('world')
    expect(wrapper.options.sync).to.equal(true)
  })

  it('handles methods that update watchers', () => {
    const TestComponent = {
      template: `
      <div id="app">
        <div v-if="open">
          <div>
            <pre>data.text: <em>{{ text }}</em></pre>
          </div>
          <!-- Tests fail in 1.0.0-beta.13 with .fails portion of the code -->
          <div class="fails">
            <pre>computed.text: <em>{{ computedText }}</em></pre>
          </div>
        </div>
        </div>
      `,
      data () {
        return {
          open: false,
          text: '',
          basket: []
        }
      },
      computed: {
        computedText () {
          return this.text
        }
      },
      created () {
        window.addEventListener('click', this.clickHandler)
      },
      destroyed () {
        window.removeEventListener('click', this.clickHandler)
      },
      watch: {
        text () {
          this.basket.push(this.computedText)
        }
      },
      methods: {
        clickHandler () {
          this.open = !this.open
        }
      }
    }

    const wrapper = mountingMethod(TestComponent, {
      attachToDocument: true
    })
    wrapper.trigger('click')
    expect(wrapper.vm.text).to.equal('')
    expect(wrapper.vm.basket.length).to.equal(0)
    wrapper.setData({ text: 'foo' })
    expect(wrapper.vm.text).to.equal('foo')
    expect(wrapper.vm.computedText).to.equal('foo')
    expect(wrapper.vm.basket[0]).to.equal('foo')
  })

  it('does not set watchers to sync if set to false', (done) => {
    const TestComponent = {
      template: '<div>{{someData}}</div>',
      data: () => ({
        someData: 'hello'
      })
    }
    const wrapper = mountingMethod(TestComponent, {
      sync: false
    })

    expect(wrapper.text()).to.equal('hello')
    wrapper.vm.someData = 'world'
    expect(wrapper.text()).to.equal('hello')
    expect(wrapper.options.sync).to.equal(false)
    setTimeout(() => {
      expect(wrapper.text()).to.equal('world')
      done()
    })
  })
})
