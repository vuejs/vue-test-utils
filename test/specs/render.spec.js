import { render } from '~vue/server-test-utils'

describe('render', () => {
  it('returns a cheerio wrapper of the rendered component', () => {
    const TestComponent = {
      template: '<div><h2>Test</h2><p></p><p></p></div>'
    }
    const wrapper = render(TestComponent)
    expect(wrapper.find('h2').text()).to.equal('Test')
    expect(wrapper.find('p').length).to.equal(2)
  })
})
