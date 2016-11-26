module.exports = function filterSpecFiles (f, stat) {
  return stat.isDirectory() || !f.endsWith('.spec.js')
}
