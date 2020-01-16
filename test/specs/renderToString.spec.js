import { renderToString } from '@vue/server-test-utils'
import { createLocalVue } from '@vue/test-utils'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import { describeDoNotRunIf } from 'conditional-specs'

describeDoNotRunIf(process.env.TEST_ENV !== 'node', 'renderToString', () => {
  it('returns a promise', async () => {
    const str = await renderToString({
      template: `<div>{{this.val}}</div>`,
      data() {
        return { val: '123' }
      }
    })
    expect(str).to.contain('123')
  })

  it('mounts functional component with a defined context when no context object passed in options', async () => {
    const defaultValue = '[vue-test-utils]: testProp default value'
    const Component = {
      functional: true,
      props: {
        testProp: {
          type: String,
          default: defaultValue
        }
      },
      render: (h, { props }) => h('div', props.testProp)
    }
    const str = await renderToString(Component)
    expect(str).to.contain(defaultValue)
  })

  it('mounts component using passed localVue as base Vue', async () => {
    const TestComponent = {
      template: `<div>{{test}}</div>`
    }
    const localVue = createLocalVue()
    localVue.prototype.test = 'some value'
    const str = await renderToString(TestComponent, {
      localVue: localVue
    })
    expect(str).to.contain('some value')
  })

  it('adds variables to vm when passed', async () => {
    const TestComponent = {
      template: `
          <div>
            {{$store.store}}
            {{$route.path}}
          </div>
        `
    }
    const $store = { store: true }
    const $route = { path: 'http://test.com' }
    const str = await renderToString(TestComponent, {
      mocks: {
        $store,
        $route
      }
    })
    expect(str).contains('true')
    expect(str).contains('http://test.com')
  })

  it('mounts component with $parent set to options.parentComponent', async () => {
    const Parent = {
      data: () => ({
        customName: 'Parent Name'
      })
    }
    const TestComponent = {
      template: '<div>{{$parent.customName}}</div>'
    }
    const str = await renderToString(TestComponent, {
      parentComponent: Parent
    })
    expect(str).to.contain('Parent Name')
  })

  it('replaces component with template string ', async () => {
    const str = await renderToString(ComponentWithChild, {
      stubs: {
        ChildComponent: '<div class="stub"></div>'
      }
    })

    expect(str).to.contain('"stub"')
  })
})
