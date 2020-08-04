import { describeWithShallowAndMount } from '~resources/utils'
import '@vue/test-utils'

describeWithShallowAndMount('at', mountingMethod => {
  it('returns Wrapper at index', () => {
    const TestComponent = {
      template: '<div><p /><p class="index-1"/></div>'
    }
    const p = mountingMethod(TestComponent)
      .findAll('p')
      .at(1)
    expect(p.vnode).to.be.an('object')
    expect(p.classes()).to.contain('index-1')
  })

  it('returns Wrapper at index from the end when index is negative', () => {
    const TestComponent = {
      template: '<div><p class="index-first" /><p class="index-last"/></div>'
    }
    const all = mountingMethod(TestComponent).findAll('p')
    const last = all.at(-1)
    const first = all.at(-2)
    expect(last.vnode).to.be.an('object')
    expect(last.classes()).to.contain('index-last')
    expect(first.vnode).to.be.an('object')
    expect(first.classes()).to.contain('index-first')
  })

  it('returns ErrorWrapper at index when not found', () => {
    const TestComponent = {
      template: '<div></div>'
    }
    const all = mountingMethod(TestComponent).findAll('p')
    const nonExistent = all.at(0)
    expect(nonExistent.exists()).to.equal(false)
  })
})
