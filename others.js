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
 * @param {{ movement: string}} movement
 */
export const controls = player => {
  window.addEventListener("keydown", event => {
    switch (event.code) {
      case "KeyS":
      case "ArrowDown":
        player.movement = "down"
        break
      case "KeyA":
      case "ArrowLeft":
        player.movement = "left"
        break
      case "KeyD":
      case "ArrowRight":
        player.movement = "right"
        break
      default:
        player.movement = "idle"
    }
  })
}
