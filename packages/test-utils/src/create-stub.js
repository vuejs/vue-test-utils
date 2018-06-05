export default function createStub (name) {
  return {
    name,
    render: h => h('div')
  }
}

