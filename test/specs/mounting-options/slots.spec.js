import { compileToFunctions } from 'vue-template-compiler'
import Component from '~resources/components/component.vue'
import ComponentWithSlots from '~resources/components/component-with-slots.vue'
import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
import ComponentWithParentName from '~resources/components/component-with-parent-name.vue'
import { describeWithMountingMethods, vueVersion } from '~resources/utils'
import { itSkipIf, itDoNotRunIf } from 'conditional-specs'
import { mount, createLocalVue } from '~vue/test-utils'

describeWithMountingMethods('options.slots', mountingMethod => {
  it('mounts component with default slot if passed component in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: { default: Component }
    })
    if (mountingMethod.name === 'renderToString') {
      expect(wrapper).contains('<div></div>')
    } else {
      expect(wrapper.contains(Component)).to.equal(true)
    }
  })

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount' || process.env.TEST_ENV === 'node',
    'mounts component with default slot if passed component as string in slot object',
    () => {
      const CustomComponent = {
        render: h => h('time')
      }
      const TestComponent = {
        template: '<div><slot /></div>',
        components: {
          'custom-component': CustomComponent
        }
      }
      const wrapper = mountingMethod(TestComponent, {
        slots: {
          default: '<custom-component />'
        },
        components: {
          'custom-component': CustomComponent
        }
      })
      if (mountingMethod.name === 'renderToString') {
        expect(wrapper).contains('<time>')
      } else {
        expect(wrapper.contains('time')).to.equal(true)
      }
    }
  )

  it('mounts component with default slot if passed component in array in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: { default: [Component] }
    })
    if (mountingMethod.name === 'renderToString') {
      expect(wrapper).contains('<div></div>')
    } else {
      expect(wrapper.contains(Component)).to.equal(true)
    }
  })

  it('mounts component with default slot if passed object with template prop in slot object', () => {
    const compiled = compileToFunctions('<div id="div" />')
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: { default: [compiled] }
    })
    if (mountingMethod.name === 'renderToString') {
      expect(wrapper).contains('div id="div"')
    } else {
      expect(wrapper.contains('#div')).to.equal(true)
    }
  })

  itDoNotRunIf(
    process.env.TEST_ENV === 'node',
    'mounts component with default slot if passed string in slot object',
    () => {
      const wrapper = mountingMethod(ComponentWithSlots, {
        slots: { default: '<span />' }
      })
      if (mountingMethod.name === 'renderToString') {
        expect(wrapper).contains('<span')
      } else {
        expect(wrapper.contains('span')).to.equal(true)
      }
    }
  )

  itDoNotRunIf(
    process.env.TEST_ENV === 'node' || vueVersion < 2.3,
    'works correctly with class component',
    () => {
      const wrapper = mountingMethod(ComponentAsAClass, {
        slots: { default: '<span />' }
      })
      if (mountingMethod.name === 'renderToString') {
        expect(wrapper).contains('<span')
      } else {
        expect(wrapper.contains('span')).to.equal(true)
      }
    }
  )

  itDoNotRunIf(
    typeof window === 'undefined' ||
      window.navigator.userAgent.match(/Chrome|PhantomJS/i),
    'works if the UserAgent is PhantomJS when passed Component is in slot object',
    () => {
      const windowSave = window
      global.window = { navigator: { userAgent: 'PhantomJS' }} // eslint-disable-line no-native-reassign
      const wrapper = mountingMethod(ComponentWithSlots, {
        slots: { default: [Component] }
      })
      if (mountingMethod.name === 'renderToString') {
        expect(wrapper).contains('<div></div>')
      } else {
        expect(wrapper.contains(Component)).to.equal(true)
      }
      window = windowSave // eslint-disable-line no-native-reassign
    }
  )

  itSkipIf(
    mountingMethod.name === 'renderToString',
    'throws error if passed string in default slot object and vue-template-compiler is undefined',
    () => {
      const compilerSave =
        require.cache[require.resolve('vue-template-compiler')].exports
          .compileToFunctions
      require.cache[
        require.resolve('vue-template-compiler')
      ].exports.compileToFunctions = undefined
      delete require.cache[require.resolve('../../../packages/test-utils')]
      const mountingMethodFresh = require('../../../packages/test-utils')[
        mountingMethod.name
      ]
      const message =
        '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass precompiled components if vue-template-compiler is undefined'
      const fn = () =>
        mountingMethodFresh(ComponentWithSlots, {
          slots: { default: '<span />' }
        })
      try {
        expect(fn)
          .to.throw()
          .with.property('message', message)
      } catch (err) {
        require.cache[
          require.resolve('vue-template-compiler')
        ].exports.compileToFunctions = compilerSave
        throw err
      }
      require.cache[
        require.resolve('vue-template-compiler')
      ].exports.compileToFunctions = compilerSave
    }
  )

  itDoNotRunIf(
    process.env.TEST_ENV === 'node',
    'mounts component with default slot if passed string in slot array object',
    () => {
      const wrapper = mountingMethod(ComponentWithSlots, {
        slots: { default: ['<span />'] }
      })
      if (mountingMethod.name === 'renderToString') {
        expect(wrapper).contains('<span')
      } else {
        expect(wrapper.contains('span')).to.equal(true)
      }
    }
  )

  itSkipIf(
    mountingMethod.name === 'renderToString',
    'throws error if passed string in default slot array vue-template-compiler is undefined',
    () => {
      const compilerSave =
        require.cache[require.resolve('vue-template-compiler')].exports
          .compileToFunctions
      require.cache[
        require.resolve('vue-template-compiler')
      ].exports.compileToFunctions = undefined
      delete require.cache[require.resolve('../../../packages/test-utils')]
      const mountingMethodFresh = require('../../../packages/test-utils')[
        mountingMethod.name
      ]
      const message =
        '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass precompiled components if vue-template-compiler is undefined'
      const fn = () =>
        mountingMethodFresh(ComponentWithSlots, {
          slots: { default: ['<span />'] }
        })
      try {
        expect(fn)
          .to.throw()
          .with.property('message', message)
      } catch (err) {
        require.cache[
          require.resolve('vue-template-compiler')
        ].exports.compileToFunctions = compilerSave
        throw err
      }
      require.cache[
        require.resolve('vue-template-compiler')
      ].exports.compileToFunctions = compilerSave
    }
  )

  it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: {
        header: [Component],
        footer: [Component]
      }
    })
    if (mountingMethod.name === 'renderToString') {
      expect(wrapper).contains(
        '<header><div></div></header> <main></main> <footer><div></div></footer>'
      )
    } else {
      expect(wrapper.findAll(Component).length).to.equal(2)
    }
  })

  it('mounts component with text slot', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: {
        header: 'hello,',
        default: 'world'
      }
    })
    if (mountingMethod.name === 'renderToString') {
      expect(wrapper).contains(
        '<div data-server-rendered="true" class="container"><header>hello,</header> <main>world</main> <footer></footer></div>'
      )
    } else {
      expect(wrapper.html()).to.equal(
        '<div class="container"><header>hello,</header> <main>world</main> <footer></footer></div>'
      )
    }
  })

  it('mounts functional component with text slot', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, [ctx.slots().default, ctx.slots().header])
    }
    const wrapper = mountingMethod(TestComponent, {
      slots: {
        default: 'hello,',
        header: 'world'
      }
    })
    if (mountingMethod.name === 'renderToString') {
      expect(wrapper).contains('hello,world')
    } else {
      expect(wrapper.text()).to.contain('hello,world')
    }
  })

  it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: {
        header: Component
      }
    })
    if (mountingMethod.name === 'renderToString') {
      expect(wrapper).contains('<header><div></div></header>')
    } else {
      expect(wrapper.findAll(Component).length).to.equal(1)
      expect(Array.isArray(wrapper.vm.$slots.header)).to.equal(true)
    }
  })

  it('mounts functional component with default slot if passed component in slot object', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const wrapper = mountingMethod(TestComponent, {
      slots: { default: Component }
    })
    if (mountingMethod.name === 'renderToString') {
      const renderedAttribute =
        vueVersion < 2.3 ? 'server-rendered' : 'data-server-rendered'
      expect(wrapper).contains(
        `<div ${renderedAttribute}="true"><div></div></div>`
      )
    } else {
      expect(wrapper.contains(Component)).to.equal(true)
    }
  })

  it('mounts component with default slot if passed component in slot object', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const wrapper = mountingMethod(TestComponent, {
      slots: { default: [Component] }
    })
    if (mountingMethod.name === 'renderToString') {
      const renderedAttribute =
        vueVersion < 2.3 ? 'server-rendered' : 'data-server-rendered'
      expect(wrapper).contains(
        `<div ${renderedAttribute}="true"><div></div></div>`
      )
    } else {
      expect(wrapper.contains(Component)).to.equal(true)
    }
  })

  it('mounts component with default slot if passed object with template prop in slot object', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const compiled = compileToFunctions('<div id="div" />')
    const wrapper = mountingMethod(TestComponent, {
      slots: { default: [compiled] }
    })
    if (mountingMethod.name === 'renderToString') {
      expect(wrapper).contains('<div id="div">')
    } else {
      expect(wrapper.contains('#div')).to.equal(true)
    }
  })

  itDoNotRunIf(
    process.env.TEST_ENV === 'node',
    'mounts component with default slot if passed string in slot object',
    () => {
      const TestComponent = {
        name: 'component-with-slots',
        functional: true,
        render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
      }
      const wrapper = mountingMethod(TestComponent, {
        slots: { default: '<span />' }
      })
      if (mountingMethod.name === 'renderToString') {
        expect(wrapper).contains('<span')
      } else {
        expect(wrapper.contains('span')).to.equal(true)
      }
    }
  )

  itDoNotRunIf(
    process.env.TEST_ENV === 'node',
    'mounts component with named slot if passed string in slot object',
    () => {
      const TestComponent = {
        functional: true,
        render: (h, ctx) => h('div', {}, ctx.slots().named)
      }
      const wrapper = mountingMethod(TestComponent, {
        slots: { named: Component }
      })
      if (mountingMethod.name === 'renderToString') {
        expect(wrapper).contains('<div></div>')
      } else {
        expect(wrapper.contains(Component)).to.equal(true)
      }
    }
  )

  itDoNotRunIf(
    process.env.TEST_ENV === 'node',
    'mounts component with named slot if passed string in slot object in array',
    () => {
      const TestComponent = {
        functional: true,
        render: (h, ctx) => h('div', {}, ctx.slots().named)
      }
      const wrapper = mountingMethod(TestComponent, {
        slots: { named: [Component] }
      })
      if (mountingMethod.name === 'renderToString') {
        expect(wrapper).contains('<div></div>')
      } else {
        expect(wrapper.contains(Component)).to.equal(true)
      }
    }
  )

  itDoNotRunIf(
    process.env.TEST_ENV === 'node',
    'mounts component with named slot if passed string in slot object in array',
    () => {
      const TestComponent = {
        functional: true,
        render: (h, ctx) => h('div', {}, ctx.slots().named)
      }
      const wrapper = mountingMethod(TestComponent, {
        slots: { named: '<span />' }
      })
      if (mountingMethod.name === 'renderToString') {
        expect(wrapper).contains('<span')
      } else {
        expect(wrapper.contains('span')).to.equal(true)
      }
    }
  )

  itDoNotRunIf(
    process.env.TEST_ENV === 'node',
    'mounts component with named slot if passed string in slot object in array',
    () => {
      const TestComponent = {
        functional: true,
        render: (h, ctx) => h('div', {}, ctx.slots().named)
      }
      const wrapper = mountingMethod(TestComponent, {
        slots: { named: ['<span />'] }
      })
      if (mountingMethod.name === 'renderToString') {
        expect(wrapper).contains('<span')
      } else {
        expect(wrapper.contains('span')).to.equal(true)
      }
    }
  )

  it('throws error if passed false for named slots', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const fn = () =>
      mountingMethod(TestComponent, { slots: { named: [false] }})
    const message =
      '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

  it('throws error if passed a number for named slots', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const fn = () => mountingMethod(TestComponent, { slots: { named: [1] }})
    const message =
      '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

  it('throws error if passed false for named slots', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const fn = () => mountingMethod(TestComponent, { slots: { named: false }})
    const message =
      '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

  it('throws error if passed a number for named slots', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const fn = () => mountingMethod(TestComponent, { slots: { named: 1 }})
    const message =
      '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

  itSkipIf(
    mountingMethod.name === 'renderToString',
    'throws error if passed string in default slot array when vue-template-compiler is undefined',
    () => {
      const compilerSave =
        require.cache[require.resolve('vue-template-compiler')].exports
          .compileToFunctions
      require.cache[require.resolve('vue-template-compiler')].exports = {
        compileToFunctions: undefined
      }
      delete require.cache[require.resolve('../../../packages/test-utils')]
      const mountingMethodFresh = require('../../../packages/test-utils')[
        mountingMethod.name
      ]
      const message =
        '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass precompiled components if vue-template-compiler is undefined'
      const fn = () => {
        mountingMethodFresh(ComponentWithSlots, {
          slots: { default: ['<span />'] }
        })
      }
      try {
        expect(fn)
          .to.throw()
          .with.property('message', message)
      } catch (err) {
        require.cache[
          require.resolve('vue-template-compiler')
        ].exports.compileToFunctions = compilerSave
        throw err
      }
      require.cache[
        require.resolve('vue-template-compiler')
      ].exports.compileToFunctions = compilerSave
    }
  )

  itDoNotRunIf(
    mountingMethod.name === 'renderToString',
    'does not error when triggering a click in a slot',
    () => {
      const Parent = {
        name: 'Parent',
        template: `
        <Child>
          <template slot-scope="props">
            <slot name="content"></slot>
          </template>
        </Child>
      `
      }

      const Child = {
        name: 'Child',
        template: `
        <div>
          <slot val="123"></slot>
        </div>
      `
      }

      const wrapper = mountingMethod(Parent, {
        slots: { content: '*parent content!*' },
        stubs: { Child }
      })
      wrapper.find('div').trigger('click')
    }
  )

  it('mounts component with default slot if passed class component in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: { default: ComponentAsAClass }
    })
    if (mountingMethod.name === 'renderToString') {
      expect(wrapper).contains('<div></div>')
    } else {
      expect(wrapper.contains(ComponentAsAClass)).to.equal(true)
    }
  })

  it('mounts component with default slot if passed class component in array in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: { default: [ComponentAsAClass] }
    })
    if (mountingMethod.name === 'renderToString') {
      expect(wrapper).contains('<div></div>')
    } else {
      expect(wrapper.contains(ComponentAsAClass)).to.equal(true)
    }
  })

  itDoNotRunIf(
    mountingMethod.name === 'renderToString',
    'mounts component with default slot if passed string in slot object',
    () => {
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
      const wrapper8 = mountingMethod(ComponentWithSlots, { slots: { default: '   space ' }})
      expect(wrapper8.find('main').html()).to.equal('<main>   space </main>')
    }
  )

  itDoNotRunIf(
    mountingMethod.name === 'renderToString',
    'sets a component which can access the parent component and the child component',
    () => {
      const localVue = createLocalVue()
      localVue.prototype.bar = 'FOO'
      const ParentComponent = mount(
        {
          name: 'parentComponent',
          template: '<div><slot /></div>',
          data () {
            return {
              time: 1,
              childComponentName: ''
            }
          }
        },
        {
          components: {
            ComponentWithParentName
          },
          slots: {
            default: [
              '<component-with-parent-name :fromLocalVue="bar" :time="time" />',
              '<component-with-parent-name :fromLocalVue="bar" :time="time" />'
            ]
          },
          localVue
        }
      )
      const childComponentName = 'component-with-parent-name'
      expect(ParentComponent.vm.childComponentName).to.equal(childComponentName)
      expect(ParentComponent.vm.$children.length).to.equal(2)
      expect(ParentComponent.vm.$children.every(c => c.$options.name === childComponentName)).to.equal(true)
      expect(ParentComponent.html()).to.equal('<div><div><span baz="qux">1,FOO,quux</span></div><div><span baz="qux">1,FOO,quux</span></div></div>')
      ParentComponent.vm.time = 2
      expect(ParentComponent.vm.childComponentName).to.equal(childComponentName)
      expect(ParentComponent.vm.$children.length).to.equal(2)
      expect(ParentComponent.vm.$children.every(c => c.$options.name === childComponentName)).to.equal(true)
      expect(ParentComponent.html()).to.equal('<div><div><span baz="qux">2,FOO,quux</span></div><div><span baz="qux">2,FOO,quux</span></div></div>')
    }
  )
})
