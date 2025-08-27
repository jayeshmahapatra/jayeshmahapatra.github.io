module.exports = async (tp) => {
  let fileDateMatch = tp.file.title.match(/^(\d{4}-\d{2}-\d{2})/)
  return fileDateMatch ? fileDateMatch[1] : tp.date.now("YYYY-MM-DD")
}
