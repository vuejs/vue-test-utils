import { render } from '~vue/server-test-utils'
import Cheerio from 'cheerio'
import { describeDoNotRunIf } from 'conditional-specs'

describeDoNotRunIf(process.env.TEST_ENV !== 'node', 'render', () => {
  it('returns a cheerio wrapper of the rendered component', async () => {
    const TestComponent = {
      template: '<div><h2>Test</h2><p></p><p></p></div>'
    }
    const wrapper = await render(TestComponent)
    expect(wrapper).to.be.an.instanceof(Cheerio)
    expect(wrapper.find('h2').text()).to.equal('Test')
    expect(wrapper.find('p').length).to.equal(2)
  })
})
