import store from '../src/store'

describe('store auth state', () => {
  it('sets and clears token', () => {
    store.commit('setToken', 'abc-token')
    expect(store.state.token).toBe('abc-token')

    store.commit('setToken', '')
    expect(store.state.token).toBe('')
  })

  it('sets profile', () => {
    store.commit('setProfile', { username: 'tester', role: 'USER' })
    expect(store.state.profile.username).toBe('tester')
  })
})
