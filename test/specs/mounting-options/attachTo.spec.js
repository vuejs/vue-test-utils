import { describeWithShallowAndMount } from '~resources/utils'

const innerHTML = '<input><span>Hello world</span>'
const outerHTML = `<div id="attach-to">${innerHTML}</div>`
const ssrHTML = `<div id="attach-to" data-server-rendered="true">${innerHTML}</div>`
const template = '<div id="attach-to"><input /><span>Hello world</span></div>'
const TestComponent = { template }

describeWithShallowAndMount('options.attachTo', mountingMethod => {
  it('should not mount to document when null', () => {
    const wrapper = mountingMethod(TestComponent, {})
    expect(wrapper.vm.$el.parentNode).to.be.null
    wrapper.destroy()
  })
  it('attaches to a provided HTMLElement', () => {
    const div = document.createElement('div')
    div.id = 'root'
    document.body.appendChild(div)
    expect(document.getElementById('root')).to.not.be.null
    expect(document.getElementById('attach-to')).to.be.null
    const wrapper = mountingMethod(TestComponent, {
      attachTo: div
    })

    const root = document.getElementById('root')
    const rendered = document.getElementById('attach-to')
    expect(wrapper.vm.$el.parentNode).to.not.be.null
    expect(root).to.be.null
    expect(rendered).to.not.be.null
    expect(rendered.outerHTML).to.equal(outerHTML)
    expect(wrapper.options.attachedToDocument).to.equal(true)
    wrapper.destroy()
    expect(document.getElementById('attach-to')).to.be.null
  })
  it('attaches to a provided CSS selector string', () => {
    const div = document.createElement('div')
    div.id = 'root'
    document.body.appendChild(div)
    expect(document.getElementById('root')).to.not.be.null
    expect(document.getElementById('attach-to')).to.be.null
    const wrapper = mountingMethod(TestComponent, {
      attachTo: '#root'
    })

    const root = document.getElementById('root')
    const rendered = document.getElementById('attach-to')
    expect(wrapper.vm.$el.parentNode).to.not.be.null
    expect(root).to.be.null
    expect(rendered).to.not.be.null
    expect(rendered.outerHTML).to.equal(outerHTML)
    expect(wrapper.options.attachedToDocument).to.equal(true)
    wrapper.destroy()
    expect(document.getElementById('attach-to')).to.be.null
  })

  it('correctly hydrates markup', () => {
    expect(document.getElementById('attach-to')).to.be.null

    const div = document.createElement('div')
    div.id = 'attach-to'
    div.setAttribute('data-server-rendered', 'true')
    div.innerHTML = innerHTML
    document.body.appendChild(div)
    expect(div.outerHTML).to.equal(ssrHTML)
    const wrapper = mountingMethod(TestComponent, {
      attachTo: '#attach-to'
    })

    const rendered = document.getElementById('attach-to')
    expect(wrapper.vm.$el.parentNode).to.not.be.null
    expect(rendered).to.not.be.null
    expect(rendered.outerHTML).to.equal(outerHTML)
    expect(wrapper.options.attachedToDocument).to.equal(true)
    wrapper.destroy()
    expect(document.getElementById('attach-to')).to.be.null
  })
})
