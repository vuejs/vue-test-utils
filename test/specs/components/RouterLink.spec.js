import { mount, RouterLinkStub } from '~vue/test-utils'

describe('RouterLinkStub', () => {
  it('takes correct props', () => {
    const TestComponent = {
      template: `
        <div>
          <router-link
            to="to1"
            tag="tag1"
            exact="exact1"
            append="append1"
            replace="replace1"
            activeClass="activeClass1"
            exactActiveClass="exactActiveClass1"
            event="event1"
          />
        </div>
      `
    }
    const wrapper = mount(TestComponent, {
      stubs: {
        RouterLink: RouterLinkStub
      }
    })
    const routerLink = wrapper.find(RouterLinkStub)
    expect(routerLink.props().to).to.equal('to1')
    expect(routerLink.props().tag).to.equal('tag1')
    expect(routerLink.props().exact).to.equal('exact1')
    expect(routerLink.props().append).to.equal('append1')
    expect(routerLink.props().replace).to.equal('replace1')
    expect(routerLink.props().activeClass).to.equal('activeClass1')
    expect(routerLink.props().exactActiveClass).to.equal('exactActiveClass1')
    expect(routerLink.props().event).to.equal('event1')
  })

  it('renders slot content', () => {
    const TestComponent = {
      template: `
        <div>
          <router-link>some text</router-link>
        </div>
      `
    }
    const wrapper = mount(TestComponent, {
      stubs: {
        RouterLink: RouterLinkStub
      }
    })
    expect(wrapper.find(RouterLinkStub).text()).to.equal('some text')
  })
})
