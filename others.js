export const getGridData = () => {
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

/**
 * @param {{ move: string, rotate: boolean}} boxAction
 */
export const controls = boxAction => {
  window.addEventListener("keydown", event => {
    switch (event.code) {
      case "KeyT":
        boxAction.rotate = true
        break
      case "KeyS":
      case "ArrowDown":
        boxAction.move = "down"
        break
      case "KeyA":
      case "ArrowLeft":
        boxAction.move = "left"
        break
      case "KeyD":
      case "ArrowRight":
        boxAction.move = "right"
        break
    }
  })
}
