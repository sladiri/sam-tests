export const actions = ({ server }) => {
  const methods = {
    increment ({ value }) {
      return { count: value !== undefined ? value : 1 }
    },
  }

  const propose = ({ action, value }) => {
    console.log('action:', action, value)
    const proposal = methods[action]({ value })
    server.emit('accept', { proposal })
  }

  server.on('action', propose)

  return {
    dispose () {
      server.removeListener('action', propose)
    },
  }
}

export const model = ({ server }) => {
  const state = {
    count: 0,
  }

  const accept = ({ proposal }) => {
    console.log('server got proposal:', proposal)
    state.count += proposal.count
    server.emit('view', { state })
  }

  server.on('accept', accept)

  return {
    dispose () {
      server.removeListener('accept', accept)
    },
  }
}
