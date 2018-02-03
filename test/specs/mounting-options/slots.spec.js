import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue-test-utils'
import Component from '~resources/components/component.vue'
import ComponentWithSlots from '~resources/components/component-with-slots.vue'

describe('mount.slots', () => {
  let _window

  beforeEach(() => {
    _window = window
  })

  afterEach(() => {
    if (!window.navigator.userAgent.match(/Chrome/i)) {
      window = _window // eslint-disable-line no-native-reassign
    }
  })

  it('mounts component with default slot if passed component in slot object', () => {
    const wrapper = mount(ComponentWithSlots, { slots: { default: Component }})
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('mounts component with default slot if passed component in array in slot object', () => {
    const wrapper = mount(ComponentWithSlots, { slots: { default: [Component] }})
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('mounts component with default slot if passed object with template prop in slot object', () => {
    const compiled = compileToFunctions('<div id="div" />')
    const wrapper = mount(ComponentWithSlots, { slots: { default: [compiled] }})
    expect(wrapper.contains('#div')).to.equal(true)
  })

  it('mounts component with default slot if passed string in slot object', () => {
    const wrapper = mount(ComponentWithSlots, { slots: { default: '<span />' }})
    expect(wrapper.contains('span')).to.equal(true)
  })

  it('throws error if the UserAgent is PhantomJS when passed string is in slot object', () => {
    if (window.navigator.userAgent.match(/Chrome/i)) {
      return
    }
    window = { navigator: { userAgent: 'PhantomJS' }} // eslint-disable-line no-native-reassign
    const message = '[vue-test-utils]: option.slots does not support strings in PhantomJS. Please use Puppeteer, or pass a component'
    const fn = () => mount(ComponentWithSlots, { slots: { default: 'foo' }})
    expect(fn).to.throw().with.property('message', message)
  })

  it('mounts component with default slot if passed string in slot object', () => {
    const wrapper1 = mount(ComponentWithSlots, { slots: { default: 'foo<span>123</span>{{ foo }}' }})
    expect(wrapper1.find('main').html()).to.equal('<main>foo<span>123</span>bar</main>')
    const wrapper2 = mount(ComponentWithSlots, { slots: { default: '<p>1</p>{{ foo }}2' }})
    expect(wrapper2.find('main').html()).to.equal('<main><p>1</p>bar2</main>')
    const wrapper3 = mount(ComponentWithSlots, { slots: { default: '<p>1</p>{{ foo }}<p>2</p>' }})
    expect(wrapper3.find('main').html()).to.equal('<main><p>1</p>bar<p>2</p></main>')
    const wrapper4 = mount(ComponentWithSlots, { slots: { default: '123' }})
    expect(wrapper4.find('main').html()).to.equal('<main>123</main>')
    const wrapper5 = mount(ComponentWithSlots, { slots: { default: '1{{ foo }}2' }})
    expect(wrapper5.find('main').html()).to.equal('<main>1bar2</main>')
    wrapper5.trigger('keydown')
    expect(wrapper5.find('main').html()).to.equal('<main>1BAR2</main>')
    const wrapper6 = mount(ComponentWithSlots, { slots: { default: '<p>1</p><p>2</p>' }})
    expect(wrapper6.find('main').html()).to.equal('<main><p>1</p><p>2</p></main>')
    const wrapper7 = mount(ComponentWithSlots, { slots: { default: '1<p>2</p>3' }})
    expect(wrapper7.find('main').html()).to.equal('<main>1<p>2</p>3</main>')
  })

  it('throws error if passed string in default slot object and vue-template-compiler is undefined', () => {
    const compilerSave = require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions
    require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = undefined
    delete require.cache[require.resolve('../../../src/mount')]
    const mountFresh = require('../../../src/mount').default
    const message = '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined'
    const fn = () => mountFresh(ComponentWithSlots, { slots: { default: '<span />' }})
    try {
      expect(fn).to.throw().with.property('message', message)
    } catch (err) {
      require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
      throw err
    }
    require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
  })

  it('mounts component with default slot if passed string in slot array object', () => {
    const wrapper = mount(ComponentWithSlots, { slots: { default: ['<span />'] }})
    expect(wrapper.contains('span')).to.equal(true)
  })

  it('mounts component with default slot if passed string in slot text array object', () => {
    const wrapper = mount(ComponentWithSlots, { slots: { default: ['{{ foo }}<span>1</span>', 'bar'] }})
    expect(wrapper.find('main').html()).to.equal('<main>bar<span>1</span>bar</main>')
  })

  it('throws error if passed string in default slot array vue-template-compiler is undefined', () => {
    const compilerSave = require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions
    require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = undefined
    delete require.cache[require.resolve('../../../src/mount')]
    const mountFresh = require('../../../src/mount').default
    const message = '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined'
    const fn = () => mountFresh(ComponentWithSlots, { slots: { default: ['<span />'] }})
    try {
      expect(fn).to.throw().with.property('message', message)
    } catch (err) {
      require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
      throw err
    }
    require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
  })

  it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mount(ComponentWithSlots, {
      slots: {
        header: [Component],
        footer: [Component]
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(2)
  })

  it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mount(ComponentWithSlots, {
      slots: {
        header: Component
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(1)
    expect(Array.isArray(wrapper.vm.$slots.header)).to.equal(true)
  })

  it('mounts functional component with default slot if passed component in slot object', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const wrapper = mount(TestComponent, { slots: { default: Component }})
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('mounts component with default slot if passed component in slot object', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const wrapper = mount(TestComponent, { slots: { default: [Component] }})
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('mounts component with default slot if passed object with template prop in slot object', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const compiled = compileToFunctions('<div id="div" />')
    const wrapper = mount(TestComponent, { slots: { default: [compiled] }})
    expect(wrapper.contains('#div')).to.equal(true)
  })

  it('mounts component with default slot if passed string in slot object', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const wrapper = mount(TestComponent, { slots: { default: '<span />' }})
    expect(wrapper.contains('span')).to.equal(true)
  })

  it('mounts component with named slot if passed string in slot object', () => {
    const TestComponent = {
      functional: true,
      render: (h, ctx) => h('div', {}, ctx.slots().named)
    }
    const wrapper = mount(TestComponent, { slots: { named: Component }})
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('mounts component with named slot if passed string in slot object in array', () => {
    const TestComponent = {
      functional: true,
      render: (h, ctx) => h('div', {}, ctx.slots().named)
    }
    const wrapper = mount(TestComponent, { slots: { named: [Component] }})
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('mounts component with named slot if passed string in slot object in array', () => {
    const TestComponent = {
      functional: true,
      render: (h, ctx) => h('div', {}, ctx.slots().named)
    }
    const wrapper = mount(TestComponent, { slots: { named: '<span />' }})
    expect(wrapper.contains('span')).to.equal(true)
  })

  it('mounts component with named slot if passed string in slot object in array', () => {
    const TestComponent = {
      functional: true,
      render: (h, ctx) => h('div', {}, ctx.slots().named)
    }
    const wrapper = mount(TestComponent, { slots: { named: ['<span />'] }})
    expect(wrapper.contains('span')).to.equal(true)
  })

  it('throws error if passed false for named slots', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const fn = () => mount(TestComponent, { slots: { named: [false] }})
    const message = '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws error if passed a number for named slots', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const fn = () => mount(TestComponent, { slots: { named: [1] }})
    const message = '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
    expect(fn).to.throw().with.property('message', message)
  })
  it('throws error if passed false for named slots', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const fn = () => mount(TestComponent, { slots: { named: false }})
    const message = '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws error if passed a number for named slots', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const fn = () => mount(TestComponent, { slots: { named: 1 }})
    const message = '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
    expect(fn).to.throw().with.property('message', message)
  })
  it('throws error if passed string in default slot array when vue-template-compiler is undefined', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const compilerSave = require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions
    require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = undefined
    delete require.cache[require.resolve('../../../src/mount')]
    const mountFresh = require('../../../src/mount').default
    const message = '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined'
    const fn = () => mountFresh(TestComponent, { slots: { default: ['<span />'] }})
    try {
      expect(fn).to.throw().with.property('message', message)
    } catch (err) {
      require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
      throw err
    }
    require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
  })
})
