import { render } from 'packages/server-test-utils/src'
import Cheerio from 'cheerio'
import { describeDoNotRunIf } from 'conditional-specs'

describe('render', () => {
  it.todo('placeholder')
  describeDoNotRunIf(process.env.TEST_ENV !== 'node', 'render', () => {
    it('returns a cheerio wrapper of the rendered component', async () => {
      const TestComponent = {
        template: '<div><h2>Test</h2><p></p><p></p></div>'
      }
      const wrapper = await render(TestComponent)
      expect(wrapper).toBeAnInstanceof(Cheerio)
      expect(wrapper.find('h2').text()).toEqual('Test')
      expect(wrapper.find('p').length).toEqual(2)
    })
  })
})
