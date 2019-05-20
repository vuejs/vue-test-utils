import ComponentWithChild from '~resources/components/component-with-child.vue'
import ComponentWithNestedChildren from '~resources/components/component-with-nested-children.vue'
import Component from '~resources/components/component.vue'
import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
import { createLocalVue, config } from '~vue/test-utils'
import { config as serverConfig } from '~vue/server-test-utils'
import Vue from 'vue'
import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import { itDoNotRunIf, itSkipIf, itRunIf } from 'conditional-specs'

describeWithShallowAndMount('options.stub', mountingMethod => {
  const sandbox = sinon.createSandbox()
  let configStubsSave
  let serverConfigSave

  beforeEach(() => {
    configStubsSave = config.stubs
    serverConfigSave = serverConfig.stubs
    config.stubs = {}
    serverConfig.stubs = {}
  })

  afterEach(() => {
    sandbox.reset()
    sandbox.restore()
    config.stubs = configStubsSave
    serverConfig.stubs = serverConfigSave
  })

  it('accepts valid component stubs', () => {
    const ComponentWithRender = { render: h => h('div') }
    const ComponentWithoutRender = { template: '<div></div>' }
    const ExtendedComponent = { extends: ComponentWithRender }
    const SubclassedComponent = Vue.extend({ template: '<div></div>' })
    mountingMethod(ComponentWithChild, {
      stubs: {
        ChildComponent: ComponentWithRender,
        ChildComponent2: ComponentAsAClass,
        ChildComponent3: ComponentWithoutRender,
        ChildComponent4: ExtendedComponent,
        ChildComponent5: SubclassedComponent
      }
    })
  })

  it('replaces component with template string ', () => {
    const wrapper = mountingMethod(ComponentWithChild, {
      stubs: {
        ChildComponent: '<div class="stub"></div>'
      }
    })
    expect(wrapper.findAll('.stub').length).to.equal(1)
    expect(wrapper.findAll(Component).length).to.equal(1)
  })

  it('replaces component with a component', () => {
    const mounted = sandbox.stub()
    const Stub = {
      template: '<div />',
      mounted
    }
    const wrapper = mountingMethod(ComponentWithChild, {
      stubs: {
        ChildComponent: Stub
      }
    })
    expect(wrapper.findAll(Stub).length).to.equal(1)
    expect(mounted).calledOnce
  })

  it('does not error if component to stub contains no components', () => {
    mountingMethod(Component, {
      stubs: {
        doesNotExist: Component
      }
    })
  })

  itSkipIf(
    vueVersion < 2.3,
    'overrides components in extended components',
    () => {
      const extendedComponent = Vue.extend({
        name: 'extended-component',
        components: {
          ToStubComponent: {
            template: '<span />'
          }
        }
      })
      const TestComponent = extendedComponent.extend({
        template: `<to-stub-component />`
      })
      const wrapper = mountingMethod(TestComponent, {
        stubs: {
          ToStubComponent: { template: '<time />' }
        }
      })
      expect(wrapper.html()).contains('<time')
    }
  )

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'does not modify component directly',
    () => {
      const wrapper = mountingMethod(ComponentWithNestedChildren, {
        stubs: {
          ChildComponent: '<div />'
        }
      })
      expect(wrapper.findAll(Component).length).to.equal(0)

      const mountedWrapper = mountingMethod(ComponentWithNestedChildren)
      expect(mountedWrapper.findAll(Component).length).to.equal(1)
    }
  )

  it('stubs components on component if they do not already exist', () => {
    const ComponentWithGlobalComponent = {
      render: h => h('registered-component')
    }
    const wrapper = mountingMethod(ComponentWithGlobalComponent, {
      stubs: {
        'registered-component': Component
      }
    })
    expect(wrapper.html()).to.contain('</div>')
  })

  it('stubs components with dummy when passed as an array', () => {
    const ComponentWithGlobalComponent = {
      render: h => h('div', [h('registered-component')])
    }
    const wrapper = mountingMethod(ComponentWithGlobalComponent, {
      stubs: ['registered-component']
    })
    expect(wrapper.html()).to.contain('<registered-component-stub>')
  })

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'stubs nested components',
    () => {
      const GrandChildComponent = {
        template: '<span />'
      }
      const ChildComponent = {
        template: '<grand-child-component />',
        components: { GrandChildComponent }
      }
      const TestComponent = {
        template: '<child-component />',
        components: { ChildComponent }
      }
      const wrapper = mountingMethod(TestComponent, {
        stubs: ['grand-child-component']
      })
      expect(wrapper.html()).not.to.contain('<span>')
    }
  )

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount' || vueVersion < 2.3,
    'stubs nested components registered globally',
    () => {
      const GrandChildComponent = {
        render: h => h('span', ['hello'])
      }
      const ChildComponent = {
        render: h => h('grand-child-component')
      }
      const TestComponent = {
        render: h => h('child-component')
      }
      Vue.component('child-component', ChildComponent)
      Vue.component('grand-child-component', GrandChildComponent)

      const wrapper = mountingMethod(TestComponent, {
        stubs: {
          'grand-child-component': true
        }
      })
      expect(wrapper.html()).not.to.contain('<span>')
      delete Vue.options.components['child-component']
      delete Vue.options.components['grand-child-component']
    }
  )

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount' || vueVersion < 2.3,
    'stubs nested components on extended components',
    () => {
      const GrandChildComponent = {
        template: '<span />'
      }
      const ChildComponent = {
        template: '<grand-child-component />',
        components: { GrandChildComponent }
      }
      const TestComponent = {
        template: '<child-component />',
        components: { ChildComponent }
      }
      const wrapper = mountingMethod(Vue.extend(TestComponent), {
        stubs: ['grand-child-component']
      })
      expect(wrapper.html()).not.to.contain('<span>')
    }
  )

  it('renders slot content in stubs', () => {
    const TestComponent = {
      template: `
    <div>
      <stub-with-child>
          <child-component />
    </stub-with-child>
      </div>
      `
    }
    const wrapper = mountingMethod(TestComponent, {
      stubs: ['child-component', 'stub-with-child']
    })
    expect(wrapper.html()).to.contain('<child-component-stub>')
  })

  it('stubs components with dummy which has name when passed a boolean', () => {
    const ComponentWithGlobalComponent = {
      render: h => h('div', [h('registered-component')])
    }

    const wrapper = mountingMethod(ComponentWithGlobalComponent, {
      stubs: {
        'registered-component': true
      }
    })
    expect(wrapper.html()).to.contain('<registered-component-stub>')
  })

  it('stubs components with dummy when passed as an array', () => {
    const ComponentWithGlobalComponent = {
      render: h => h('registered-component')
    }
    const invalidValues = [{}, [], 3]
    const error =
      '[vue-test-utils]: each item in an options.stubs array must be a string'
    invalidValues.forEach(invalidValue => {
      const fn = () =>
        mountingMethod(ComponentWithGlobalComponent, {
          stubs: [invalidValue]
        })
      expect(fn)
        .to.throw()
        .with.property('message', error)
    })
  })

  it('throws error if passed string in object when vue-template-compiler is undefined', () => {
    const compilerSave =
      require.cache[require.resolve('vue-template-compiler')].exports
        .compileToFunctions
    require.cache[
      require.resolve('vue-template-compiler')
    ].exports.compileToFunctions = undefined
    delete require.cache[require.resolve('../../../packages/test-utils')]
    delete require.cache[require.resolve('../../../packages/server-test-utils')]
    const mountingMethodFresh = require('../../../packages/test-utils')[
      mountingMethod.name
    ]
    const message =
      '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass precompiled components if vue-template-compiler is undefined'
    const fn = () =>
      mountingMethodFresh(Component, {
        stubs: {
          ChildComponent: '<div />'
        }
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
    mountingMethod.name === 'shallowMount',
    'does not stub component when set to false',
    () => {
      const wrapper = mountingMethod(ComponentWithChild, {
        stubs: {
          ChildComponent: false
        }
      })
      expect(wrapper.html()).to.contain('<span><div></div></span>')
    }
  )

  it('combines with stubs from config', () => {
    const localVue = createLocalVue()
    config.stubs['time-component'] = '<br />'
    serverConfig.stubs['time-component'] = '<br />'

    const SpanComponent = {
      render: h => h('span')
    }
    const TimeComponent = {
      render: h => h('time')
    }
    localVue.component('span-component', SpanComponent)
    localVue.component('time-component', TimeComponent)
    const TestComponent = {
      render: h => h('div', [h('span-component'), h('time-component')])
    }

    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        'span-component': '<p />'
      },
      localVue
    })
    expect(wrapper.html()).to.contain('<br>')
    expect(wrapper.html()).to.contain('<p>')
  })

  it('prioritize mounting options over config', () => {
    const localVue = createLocalVue()
    config.stubs['time-component'] = '<p />'
    const TimeComponent = {
      render: h => h('time')
    }
    localVue.component('time-component', TimeComponent)
    const TestComponent = {
      render: h => h('div', [h('time-component')])
    }

    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        'time-component': '<span />'
      },
      localVue
    })
    expect(wrapper.html()).to.contain('<span>')
  })

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'stubs on child components',
    () => {
      const TestComponent = {
        template: '<transition></transition>'
      }
      const wrapper = mountingMethod(
        {
          components: { 'test-component': TestComponent },
          template: '<test-component />'
        },
        {
          stubs: {
            transition: 'time'
          }
        }
      )
      expect(wrapper.find('time').exists()).to.equal(false)
    }
  )

  it('config handles stubs as an array', () => {
    const localVue = createLocalVue()
    config.stubs['time-component'] = '<p />'
    serverConfig.stubs['time-component'] = '<p />'
    const TimeComponent = {
      render: h => h('time')
    }
    localVue.component('time-component', TimeComponent)
    const TestComponent = {
      render: h => h('div', [h('time-component')])
    }

    const wrapper = mountingMethod(TestComponent, {
      stubs: ['a-component'],
      localVue
    })

    expect(wrapper.html()).to.contain('</p>')
  })

  it('handles components without a render function', () => {
    const TestComponent = {
      template: `
        <div>
          <stub-component />
        </div>
      `,
      components: {
        stubComponent: { template: '<div />' }
      }
    }
    const StubComponent = {
      template: '<div>No render function</div>'
    }

    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        'stub-component': StubComponent
      }
    })
    expect(wrapper.html()).contains('No render function')
  })

  it('throws an error when passed a circular reference', () => {
    const names = ['child-component', 'ChildComponent', 'childComponent']
    const validValues = [
      '<NAME-suffix />',
      '<prefix-NAME />',
      '<cmp NAME></cmp>',
      '<cmp something="NAME"></cmp>',
      '<NAMEl />'
    ]
    const invalidValues = [
      '<NAME />',
      '<NAME   />',
      '<NAME></NAME>',
      '<NAME aProp="something"></NAME>',
      '<NAME  ></NAME>'
    ]
    const error =
      '[vue-test-utils]: options.stub cannot contain a circular reference'
    names.forEach(name => {
      invalidValues.forEach(invalidValue => {
        const fn = () =>
          mountingMethod(ComponentWithChild, {
            stubs: {
              ChildComponent: invalidValue.replace(/NAME/g, name)
            }
          })
        expect(fn)
          .to.throw()
          .with.property('message', error)
      })
      validValues.forEach(validValue => {
        mountingMethod(ComponentWithChild, {
          stubs: {
            ChildComponent: validValue.replace(/NAME/g, name)
          }
        })
      })
    })
  })

  it('throws an error when passed an invalid value as stub', () => {
    const error =
      '[vue-test-utils]: options.stub values must be passed a string or component'
    const invalidValues = [1, null, [], {}, NaN]
    invalidValues.forEach(invalidValue => {
      const fn = () =>
        mountingMethod(ComponentWithChild, {
          stubs: {
            ChildComponent: invalidValue
          }
        })
      expect(fn)
        .to.throw()
        .with.property('message', error)
    })
  })

  itRunIf(
    vueVersion < 2.3,
    'throws an error if used with an extended component in Vue 2.3',
    () => {
      const TestComponent = Vue.extend({
        template: '<div></div>'
      })
      const message =
        `[vue-test-utils]: options.stubs is not supported for components ` +
        `created with Vue.extend in Vue < 2.3. You can set stubs to false ` +
        `to mount the component.`
      const fn = () =>
        mountingMethod(TestComponent, {
          stubs: {
            something: 'true'
          },
          mocks: false
        })
      expect(fn)
        .to.throw()
        .with.property('message', message)
    }
  )

  it('works with async components', () => {
    const StubComponent = {
      template: '<h1 />'
    }
    const TestComponent = {
      template: `<div>
      <dynamic-hello />
      <dynamic-hello-2 />
      <dynamic-hello-3 />
      </div>`,
      components: {
        DynamicHello: () => import('~resources/components/component.vue'),
        DynamicHello2: () => import('~resources/components/component.vue'),
        DynamicHello3: () => import('~resources/components/component.vue')
      }
    }
    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        DynamicHello: '<span />',
        DynamicHello2: true,
        DynamicHello3: StubComponent
      }
    })
    expect(wrapper.html()).to.contain('span')
    expect(wrapper.html()).to.contain('dynamichello2-stub')
    expect(wrapper.html()).to.contain('h1')
  })

  it('uses original component stub', () => {
    const Stub = {
      template: '<div />'
    }
    const ToStub = {
      template: '<div />'
    }
    const TestComponent = {
      template: '<div><to-stub /></div>',
      components: {
        ToStub
      }
    }
    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        ToStub: Stub
      }
    })
    expect(wrapper.find(ToStub).exists()).to.be.false
    expect(wrapper.find(Stub).exists()).to.be.true
  })

  it('should render functions in props as a deterministic string', () => {
    const ChildComponent = {
      name: 'child-component',
      props: {
        foo: {
          type: Function,
          required: true
        },
        bar: {
          type: Array,
          required: true
        },
        qux: {
          type: String,
          required: true
        }
      },
      template: '<div />'
    }

    const FunctionalChildComponent = {
      ...ChildComponent,
      name: 'functional-child-component',
      functional: true
    }

    const ParentComponent = {
      components: {
        ChildComponent,
        FunctionalChildComponent
      },
      name: 'parent-component',
      template: `
        <div>
          <child-component
            :foo="foo"
            :bar="bar"
            :qux="qux" />
          <functional-child-component
            :foo="foo"
            :bar="bar"
            :qux="qux" />
        </div>
      `,
      data () {
        return {
          foo: () => 42,
          bar: [1, 'string', () => true],
          qux: 'qux'
        }
      }
    }

    const wrapper = mountingMethod(ParentComponent, {
      stubs: ['child-component', 'functional-child-component']
    })

    expect(wrapper.html()).to.equal(
      `<div>\n` +
      `  <child-component-stub foo="[Function]" bar="1,string,[Function]" qux="qux"></child-component-stub>\n` +
      `  <functional-child-component-stub foo="[Function]" bar="1,string,[Function]" qux="qux"></functional-child-component-stub>\n` +
      `</div>`
    )
  })
})
