import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('options.sync', mountingMethod => {
  const sandbox = sinon.createSandbox()

  beforeEach(() => {
    sandbox.stub(console, 'error').callThrough()
  })

  afterEach(() => {
    sandbox.restore()
  })

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
    const syncValue = vueVersion < 2.5 ? 'COMPAT_SYNC_MODE' : true

    expect(wrapper.text()).to.equal('hello')
    wrapper.vm.someData = 'world'
    expect(wrapper.text()).to.equal('world')
    expect(wrapper.options.sync).to.equal(syncValue)
  })

  it('sets watchers to sync if undefined', () => {
    const TestComponent = {
      template: '<div>{{someData}}</div>',
      data: () => ({
        someData: 'hello'
      })
    }
    const wrapper = mountingMethod(TestComponent)
    const syncValue = vueVersion < 2.5 ? 'COMPAT_SYNC_MODE' : true

    expect(wrapper.text()).to.equal('hello')
    wrapper.vm.someData = 'world'
    expect(wrapper.text()).to.equal('world')
    expect(wrapper.options.sync).to.equal(syncValue)
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
      data() {
        return {
          open: false,
          text: '',
          basket: []
        }
      },
      computed: {
        computedText() {
          return this.text
        }
      },
      created() {
        window.addEventListener('click', this.clickHandler)
      },
      destroyed() {
        window.removeEventListener('click', this.clickHandler)
      },
      watch: {
        text() {
          this.basket.push(this.computedText)
        }
      },
      methods: {
        clickHandler() {
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

  it('does not set watchers to sync if set to false', done => {
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

  it('call updated when sync is not false', () => {
    const childComponentSpy = sandbox.stub()
    const ChildComponent = {
      template: '<div>{{ foo }}</div>',
      props: ['foo'],
      updated() {
        childComponentSpy()
      }
    }
    const spy = sandbox.stub()
    const TestComponent = {
      template: '<div>{{ foo }}<child-component :foo="foo" /></div>',
      data() {
        return {
          foo: 'foo'
        }
      },
      updated() {
        spy()
      }
    }
    const wrapper = mountingMethod(TestComponent, {
      stubs: { 'child-component': ChildComponent },
      sync: true
    })
    expect(spy.notCalled).to.equal(true)
    expect(childComponentSpy.notCalled).to.equal(true)
    expect(wrapper.html()).to.equal('<div>foo<div>foo</div></div>')
    wrapper.vm.foo = 'bar'
    expect(spy.calledOnce).to.equal(true)
    expect(childComponentSpy.calledOnce).to.equal(true)
    expect(wrapper.html()).to.equal('<div>bar<div>bar</div></div>')
  })

  itDoNotRunIf(
    vueVersion > 2.4,
    'warns if Vue version is less than 2.5.18',
    () => {
      const TestComponent = {
        template: '<div />'
      }
      mountingMethod(TestComponent)
      expect(console.error).calledWith(
        sinon.match('Vue Test Utils runs in sync mode by default')
      )
    }
  )
})
