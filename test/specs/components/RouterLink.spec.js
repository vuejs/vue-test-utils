import RouterLinkStub from '../.././../packages/test-utils/src/components/RouterLinkStub'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('RouterLinkStub', mountingMethod => {
  it('takes correct props', () => {
    const TestComponent = {
      template: `
        <div>
          <router-link
            to="to1"
            tag="a"
            activeClass="activeClass1"
            exactActiveClass="exactActiveClass1"
            event="event1"
            exact-path-active-class="exact-path-active-class"
            exact
            exact-path
            append
            replace
          />
        </div>
      `
    }
    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        RouterLink: RouterLinkStub
      }
    })

    const routerLink = wrapper.getComponent(RouterLinkStub)
    expect(routerLink.props().to).toEqual('to1')
    expect(routerLink.props().tag).toEqual('a')
    expect(routerLink.props().exact).toEqual(true)
    expect(routerLink.props().exactPath).toEqual(true)
    expect(routerLink.props().append).toEqual(true)
    expect(routerLink.props().replace).toEqual(true)
    expect(routerLink.props().activeClass).toEqual('activeClass1')
    expect(routerLink.props().exactActiveClass).toEqual('exactActiveClass1')
    expect(routerLink.props().exactPathActiveClass).toEqual(
      'exact-path-active-class'
    )
    expect(routerLink.props().event).toEqual('event1')
  })

  it('renders slot content', () => {
    const TestComponent = {
      template: `
        <div>
          <router-link to="/">some text</router-link>
        </div>
      `
    }
    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        RouterLink: RouterLinkStub
      }
    })
    expect(wrapper.getComponent(RouterLinkStub).text()).toEqual('some text')
  })
})
