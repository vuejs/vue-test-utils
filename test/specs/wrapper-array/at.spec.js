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
    expect(p.vnode).toBeTruthy()
    expect(p.classes()).toContain('index-1')
  })

  it('returns Wrapper at index from the end when index is negative', () => {
    const TestComponent = {
      template: '<div><p class="index-first" /><p class="index-last"/></div>'
    }
    const all = mountingMethod(TestComponent).findAll('p')
    const last = all.at(-1)
    const first = all.at(-2)
    expect(last.vnode).toBeTruthy()
    expect(last.classes()).toContain('index-last')
    expect(first.vnode).toBeTruthy()
    expect(first.classes()).toContain('index-first')
  })

  it('throws error if no item exists at index', () => {
    const index = 2
    const TestComponent = {
      template: '<div><p /><p class="index-1"/></div>'
    }
    const message = `[vue-test-utils]: no item exists at ${index}`
    expect(() =>
      mountingMethod(TestComponent)
        .findAll('p')
        .at(index)
    ).toThrow(message)
  })

  it('throws error if no item exists at negative index', () => {
    const index = -3
    const TestComponent = {
      template: '<div><p /><p class="index-1"/></div>'
    }
    const message = `[vue-test-utils]: no item exists at -3 (normalized to -1)`
    expect(() =>
      mountingMethod(TestComponent)
        .findAll('p')
        .at(index)
    ).toThrow(message)
  })
})
