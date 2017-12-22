import { sleep } from '~vue-test-utils'

describe('sleep', () => {
  it('sleeps asynchronously', async function () {
    let foo = 'foo'
    new Promise(resolve => {
      setTimeout(() => {
        foo = 'FOO'
      }, 25)
    })
    await sleep(100)
    expect(foo).to.equal('FOO')
  })
})
