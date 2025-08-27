module.exports = async (tp) => {
  let content = tp.file.content.split("\n")
  let title = content.find((line) => line.match(/^#\s+/))
  if (title) title = title.replace(/^#\s+/, "")
  else title = tp.file.title
  return title
}
