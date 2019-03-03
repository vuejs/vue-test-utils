import { compileToFunctions } from 'vue-template-compiler'
import Component from '~resources/components/component.vue'
import ComponentWithSlots from '~resources/components/component-with-slots.vue'
import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
import ComponentWithParentName from '~resources/components/component-with-parent-name.vue'
import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'
import { mount, createLocalVue } from '~vue/test-utils'

describeWithShallowAndMount('options.slots', mountingMethod => {
  it('mounts component with default slot if passed component in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: { default: Component }
    })
    expect(wrapper.contains(Component)).to.equal(true)
  })

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount' || process.env.TEST_ENV === 'node',
    'mounts component with default slot if passed component as string in slot object',
    () => {
      const CustomComponent = {
        render: h => h('time')
      }
      const localVue = createLocalVue()
      localVue.component('custom-component', CustomComponent)
      const TestComponent = {
        template: '<div><slot /></div>'
      }
      const wrapper = mountingMethod(TestComponent, {
        slots: {
          default: '<custom-component />'
        },
        localVue
      })
      expect(wrapper.contains('time')).to.equal(true)
    }
  )

  it('mounts component with default slot if passed component in array in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: { default: [Component] }
    })
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('mounts component with default slot if passed compiled options in slot object', () => {
    const compiled = compileToFunctions('<div id="div" />')
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: { default: [compiled] }
    })
    expect(wrapper.contains('#div')).to.equal(true)
  })

  itDoNotRunIf(
    process.env.TEST_ENV === 'node',
    'mounts component with default slot if passed string in slot object',
    () => {
      const wrapper = mountingMethod(ComponentWithSlots, {
        slots: { default: '<span />' }
      })
      expect(wrapper.contains('span')).to.equal(true)
    }
  )

  itDoNotRunIf(
    process.env.TEST_ENV === 'node' || vueVersion < 2.3,
    'works correctly with class component',
    () => {
      const wrapper = mountingMethod(ComponentAsAClass, {
        slots: { default: '<span />' }
      })
      expect(wrapper.contains('span')).to.equal(true)
    }
  )

  itDoNotRunIf(
    typeof window === 'undefined' ||
      window.navigator.userAgent.match(/Chrome|PhantomJS/i),
    'works if the UserAgent is PhantomJS when passed Component is in slot object',
    () => {
      const windowSave = window
      global.window = { navigator: { userAgent: 'PhantomJS' } } // eslint-disable-line no-native-reassign
      const wrapper = mountingMethod(ComponentWithSlots, {
        slots: { default: [Component] }
      })
      expect(wrapper.contains(Component)).to.equal(true)
      window = windowSave // eslint-disable-line no-native-reassign
    }
  )

  it('throws error if passed string in default slot object and vue-template-compiler is undefined', () => {
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
  })

  itDoNotRunIf(
    'mounts component with default slot if passed string in slot array object',
    () => {
      const wrapper = mountingMethod(ComponentWithSlots, {
        slots: { default: ['<span />'] }
      })
      expect(wrapper.contains('span')).to.equal(true)
    }
  )

  it('throws error if passed string in default slot array vue-template-compiler is undefined', () => {
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
  })

  it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: {
        header: [Component],
        footer: [Component]
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(2)
  })

  it('mounts component with default and named slots', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: {
        default: '<span>hello</span>',
        footer: '<p>world</p>'
      }
    })
    expect(wrapper.html()).to.contain('<span>hello</span>')
    expect(wrapper.html()).to.contain('<p>world</p>')
  })

  it('mounts component with default and named text slot', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: {
        footer: 'world',
        default: 'hello,'
      }
    })
    expect(wrapper.text()).to.contain('hello, world')
  })

  it('mounts functional component with text slot', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) =>
        h('div', ctx.data, [ctx.slots().default, ctx.slots().header])
    }
    const wrapper = mountingMethod(TestComponent, {
      slots: {
        default: 'hello,',
        header: 'world'
      }
    })
    expect(wrapper.text()).to.contain('hello,world')
  })

  it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
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
    const wrapper = mountingMethod(TestComponent, {
      slots: { default: Component }
    })
    expect(wrapper.contains(Component)).to.equal(true)
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
    expect(wrapper.contains(Component)).to.equal(true)
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
    expect(wrapper.contains('#div')).to.equal(true)
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
      expect(wrapper.contains('span')).to.equal(true)
    }
  )

  it('supports multiple root nodes in default slot option', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: {
        default: ['<time /><time />']
      }
    })
    expect(wrapper.findAll('time').length).to.equal(2)
  })

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
      expect(wrapper.contains(Component)).to.equal(true)
    }
  )

  it('mounts component with named slot if passed string in slot object in array', () => {
    const TestComponent = {
      functional: true,
      render: (h, ctx) => h('div', {}, ctx.slots().named)
    }
    const wrapper = mountingMethod(TestComponent, {
      slots: { named: [Component] }
    })
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('mounts component with named slot if passed string in slot object in array', () => {
    const TestComponent = {
      functional: true,
      render: (h, ctx) => h('div', {}, ctx.slots().named)
    }
    const wrapper = mountingMethod(TestComponent, {
      slots: { named: '<span />' }
    })
    expect(wrapper.contains('span')).to.equal(true)
  })

  it('mounts component with named slot if passed string in slot object in array', () => {
    const TestComponent = {
      functional: true,
      render: (h, ctx) => h('div', {}, ctx.slots().named)
    }
    const wrapper = mountingMethod(TestComponent, {
      slots: { named: ['<span />'] }
    })
    expect(wrapper.contains('span')).to.equal(true)
  })

  it('throws error if passed false for named slots', () => {
    const TestComponent = {
      name: 'component-with-slots',
      functional: true,
      render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
    }
    const fn = () =>
      mountingMethod(TestComponent, { slots: { named: [false] } })
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
    const fn = () => mountingMethod(TestComponent, { slots: { named: [1] } })
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
    const fn = () => mountingMethod(TestComponent, { slots: { named: false } })
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
    const fn = () => mountingMethod(TestComponent, { slots: { named: 1 } })
    const message =
      '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

  it('throws error if passed string in default slot array when vue-template-compiler is undefined', () => {
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
  })

  it('does not error when triggering a click in a slot', () => {
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
  })

  it('mounts component with default slot if passed class component in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: { default: ComponentAsAClass }
    })
    expect(wrapper.contains(ComponentAsAClass)).to.equal(true)
  })

  it('mounts component with default slot if passed class component in array in slot object', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: { default: [ComponentAsAClass] }
    })
    expect(wrapper.contains(ComponentAsAClass)).to.equal(true)
  })

  it('sets a component which can access the parent component and the child component', () => {
    const childComponentName = 'component-with-parent-name'
    const localVue = createLocalVue()
    localVue.prototype.bar = 'FOO'
    let ParentComponent = mount(
      {
        name: 'parentComponent',
        template: '<div><slot /></div>',
        data() {
          return {
            childComponentName: ''
          }
        }
      },
      {
        stubs: {
          ComponentWithParentName
        },
        slots: {
          default: [
            '<component-with-parent-name :fromLocalVue="bar" />',
            '<component-with-parent-name :fromLocalVue="bar" />'
          ]
        },
        localVue
      }
    )
    expect(ParentComponent.vm.childComponentName).to.equal(childComponentName)
    expect(ParentComponent.vm.$children.length).to.equal(2)
    expect(
      ParentComponent.vm.$children.every(
        c => c.$options.name === childComponentName
      )
    ).to.equal(true)
    expect(ParentComponent.html()).to.equal(
      '<div><div><span baz="qux">FOO,quux</span></div><div><span baz="qux">FOO,quux</span></div></div>'
    )

    ParentComponent = mount(
      {
        name: 'parentComponent',
        template: '<div><slot /></div>',
        data() {
          return {
            childComponentName: ''
          }
        }
      },
      {
        slots: {
          default: {
            name: childComponentName,
            template: '<p>1234</p>',
            mounted() {
              this.$parent.childComponentName = this.$options.name
            }
          }
        }
      }
    )
    expect(ParentComponent.vm.childComponentName).to.equal(childComponentName)
    expect(ParentComponent.vm.$children.length).to.equal(1)
    expect(
      ParentComponent.vm.$children.every(
        c => c.$options.name === childComponentName
      )
    ).to.equal(true)
    expect(ParentComponent.html()).to.equal('<div><p>1234</p></div>')
  })
})
