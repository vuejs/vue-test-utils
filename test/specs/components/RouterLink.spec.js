import { RouterLinkStub } from '~vue/test-utils'
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
            exact
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

    const routerLink = wrapper.find(RouterLinkStub)
    expect(routerLink.props().to).to.equal('to1')
    expect(routerLink.props().tag).to.equal('a')
    expect(routerLink.props().exact).to.equal(true)
    expect(routerLink.props().append).to.equal(true)
    expect(routerLink.props().replace).to.equal(true)
    expect(routerLink.props().activeClass).to.equal('activeClass1')
    expect(routerLink.props().exactActiveClass).to.equal('exactActiveClass1')
    expect(routerLink.props().event).to.equal('event1')
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
    expect(wrapper.find(RouterLinkStub).text()).to.equal('some text')
  })
})
