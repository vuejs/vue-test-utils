import { config } from '~vue-test-utils'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import ComponentWithNestedChildren from '~resources/components/component-with-nested-children.vue'
import Component from '~resources/components/component.vue'
import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
import { createLocalVue } from '~vue-test-utils'
import Vue from 'vue'
import {
  describeWithShallowAndMount,
  itDoNotRunIf
 } from '~resources/test-utils'

describeWithShallowAndMount('options.stub', (mountingMethod) => {
  let info
  let warn
  let configStubsSave

  beforeEach(() => {
    info = sinon.stub(console, 'info')
    warn = sinon.stub(console, 'error')
    configStubsSave = config.stubs
    config.stubs = {}
  })

  afterEach(() => {
    info.restore()
    warn.restore()
    config.stubs = configStubsSave
  })

  it('accepts valid component stubs', () => {
    const ComponentWithRender = { render: h => h('div') }
    const ComponentWithoutRender = { template: '<div></div>' }
    const ExtendedComponent = Vue.extend({ template: '<div></div>' })
    mountingMethod(ComponentWithChild, {
      stubs: {
        ChildComponent: ComponentAsAClass,
        ChildComponent2: ComponentWithRender,
        ChildComponent3: ComponentWithoutRender,
        ChildComponent4: ExtendedComponent
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
    const wrapper = mountingMethod(ComponentWithChild, {
      stubs: {
        ChildComponent: {
          render: h => h('div'),
          mounted () {
            console.info('stubbed')
          }
        }
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(1)
    expect(info.calledWith('stubbed')).to.equal(true)
  })

  it('does not error if component to stub contains no components', () => {
    mountingMethod(Component, {
      stubs: {
        doesNotExist: Component
      }
    })
  })

  itDoNotRunIf(mountingMethod.name === 'shallow',
  'does not modify component directly', () => {
    const wrapper = mountingMethod(ComponentWithNestedChildren, {
      stubs: {
        ChildComponent: '<div />'
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(0)
    const mountedWrapper = mountingMethod(ComponentWithNestedChildren)
    expect(mountedWrapper.findAll(Component).length).to.equal(1)
  })

  it('stubs components on component if they do not already exist', () => {
    const ComponentWithGlobalComponent = {
      render: h => h('registered-component')
    }
    const wrapper = mountingMethod(ComponentWithGlobalComponent, {
      stubs: {
        'registered-component': Component
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(1)
  })

  it('stubs components with dummy when passed as an array', () => {
    const ComponentWithGlobalComponent = {
      render: h => h('registered-component')
    }
    mountingMethod(ComponentWithGlobalComponent, {
      stubs: ['registered-component']
    })

    expect(warn.called).to.equal(false)
  })

  it('stubs components with dummy when passed a boolean', () => {
    const ComponentWithGlobalComponent = {
      render: h => h('registered-component')
    }
    mountingMethod(ComponentWithGlobalComponent, {
      stubs: {
        'registered-component': true
      }
    })
    expect(warn.called).to.equal(false)
  })

  it('stubs components with dummy when passed as an array', () => {
    const ComponentWithGlobalComponent = {
      render: h => h('registered-component')
    }
    const invalidValues = [{}, [], 3]
    const error = '[vue-test-utils]: each item in an options.stubs array must be a string'
    invalidValues.forEach(invalidValue => {
      const fn = () => mountingMethod(ComponentWithGlobalComponent, {
        stubs: [invalidValue]
      })
      expect(fn).to.throw().with.property('message', error)
    })
  })

  it('throws error if passed string in object when vue-template-compiler is undefined', () => {
    const compilerSave = require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions
    require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = undefined
    delete require.cache[require.resolve('../../../src/mount')]
    const mountFresh = require('../../../src/mount').default
    const message = '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined'
    const fn = () => mountFresh(Component, {
      stubs: {
        ChildComponent: '<div />'
      }
    })
    try {
      expect(fn).to.throw().with.property('message', message)
    } catch (err) {
      require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
      throw err
    }
    require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
  })

  itDoNotRunIf(mountingMethod.name === 'shallow',
    'does not stub component when set to false', () => {
      const wrapper = mountingMethod(ComponentWithChild, {
        stubs: {
          ChildComponent: false
        }})
      expect(wrapper.find('span').contains('div')).to.equal(true)
    })

  it('combines with stubs from config', () => {
    const localVue = createLocalVue()
    config.stubs['time-component'] = '<p />'
    const SpanComponent = {
      render: h => h('span')
    }
    const TimeComponent = {
      render: h => h('time')
    }
    localVue.component('span-component', SpanComponent)
    localVue.component('time-component', TimeComponent)
    const TestComponent = {
      render: h => h('div', [
        h('span-component'),
        h('time-component')
      ])
    }

    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        'span-component': '<p />'
      },
      localVue
    })
    expect(wrapper.findAll('p').length).to.equal(2)
  })

  it('prioritize mounting options over config', () => {
    const localVue = createLocalVue()
    config.stubs['time-component'] = '<p />'
    const TimeComponent = {
      render: h => h('time')
    }
    localVue.component('time-component', TimeComponent)
    const TestComponent = {
      render: h => h('div', [
        h('time-component')
      ])
    }

    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        'time-component': '<span />'
      },
      localVue
    })
    expect(wrapper.contains('span')).to.equal(true)
  })

  it('converts config to array if stubs is an array', () => {
    const localVue = createLocalVue()
    config.stubs['time-component'] = '<p />'
    const TimeComponent = {
      render: h => h('time')
    }
    localVue.component('time-component', TimeComponent)
    const TestComponent = {
      render: h => h('div', [
        h('time-component')
      ])
    }

    const wrapper = mountingMethod(TestComponent, {
      stubs: ['a-component'],
      localVue
    })
    expect(wrapper.contains('time')).to.equal(false)
    expect(wrapper.contains('p')).to.equal(false)
    expect(wrapper.html()).to.equal('<div><!----></div>')
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

    expect(wrapper.text()).contains('No render function')
  })

  it('throws an error when passed an invalid value as stub', () => {
    const error = '[vue-test-utils]: options.stub values must be passed a string or component'
    const invalidValues = [1, null, [], {}, NaN]
    invalidValues.forEach(invalidValue => {
      const fn = () => mountingMethod(ComponentWithChild, {
        stubs: {
          ChildComponent: invalidValue
        }})
      expect(fn).to.throw().with.property('message', error)
    })
  })
})
