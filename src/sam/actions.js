export function initialise () {
  return {
    propose: {initialRender: false},
  }
}

export function increment ({value}) {
  return {
    propose: {field: value},
  }
}
