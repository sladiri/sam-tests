export function model (stateRep, display) {
  return {
    state: {
      count: 0,
    },
    accept () {
      display(stateRep(this))
    },
  }
}
