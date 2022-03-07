const getGridData = () => {
  const gridComputedStyle = window.getComputedStyle(
    document.querySelector("#grid")
  )

  return {
    rows: gridComputedStyle.getPropertyValue("grid-template-rows").split(" ")
      .length,
    cols: gridComputedStyle.getPropertyValue("grid-template-columns").split(" ")
      .length,
  }
}

// NOT FINAL
const countOccurrences = (arr, x) =>
  arr.reduce((total, box) => (box.x === x ? total + 1 : total), 0)

/**
 * Source: https://stackoverflow.com/a/7102110
 * @param {number} degree
 * @param {{ x: number, y: number }} coord
 * @param {{ x: number, y: number }} origin - Center of rotation
 * @returns {{ x: number, y: number }}
 */
const rotateBox = (degree, { x, y }, origin) => {
  const radians = (degree * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const x2 = x - origin.x
  const y2 = y - origin.y
  return {
    x: x2 * cos - y2 * sin + origin.x,
    y: x2 * sin + y2 * cos + origin.y,
  }
}

export { getGridData, countOccurrences, rotateBox }
