import { controls, getGridData } from "./others.js"
import blocks from "./blocks.js"

let settings = { speed: 550, border: true }

// Get grid and populate it with boxes
const grid = document.querySelector("#grid")
const gridBoxes = grid.children
const box = document.createElement("div")
box.classList.add("box")
for (let i = 0; i < 240; i++) {
  grid.appendChild(box.cloneNode())
}

const { cols, rows } = getGridData()
let gameEnd = false
let blockAction = {
  move: "idle",
  rotate: false,
  reset: function () {
    this.move = "idle"
    this.rotate = false
  },
}

/** From xy coords to array index. (row * width) + column */
const toArrIndex = ({ x, y }) => y * cols + x
// NOT FINAL
const countOccurrences = (arr, x) =>
  arr.reduce((total, box) => (box.x === x ? total + 1 : total), 0)

/** @returns {{bCoords: { x: number, y: number }[], bName: string}}} */
const randomBlock = blocks => {
  const coords = Object.values(blocks)
  const randomNum = Math.floor(Math.random() * coords.length)
  const name = Object.keys(blocks)[randomNum]
  return {
    bCoords: coords[randomNum].map(coord => ({
      x:
        // Move block to center
        name === "O"
          ? coord.x + Math.floor(cols / 2 - 1)
          : coord.x + Math.floor(cols / 2 - 2),
      y: coord.y,
    })),
    bName: name,
  }
}

/**
 * @param {HTMLElement} gridDiv
 * @param {{x: number, y: number}[]} bCoords
 */
const renderBlock = (gridDiv, bCoords) =>
  bCoords.forEach(coord => {
    gridDiv.children[toArrIndex(coord)].classList.add("active")
  })

/**
 * Remove previously rendered block
 * @param {{ x: number; y: number;}[]} blockCoordinates
 */
const removePrevBlock = blockCoordinates =>
  blockCoordinates.map(coord =>
    gridBoxes[toArrIndex(coord)].classList.remove("active")
  )

/**
 * @param {{ x: number, y: number}} coord
 */
const isBoxStatic = coord =>
  gridBoxes[toArrIndex(coord)].classList.contains("static")

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

function game() {
  // START
  let newBlock = randomBlock(blocks)
  let { bCoords, bName } = newBlock

  renderBlock(grid, bCoords)

  // UPDATE fall
  setInterval(() => {
    if (gameEnd) return

    if (
      // If last row is reached
      bCoords.some(coord => coord.y >= rows - 1) ||
      // If falling block hit another block repalce class
      bCoords.some(coord => isBoxStatic({ x: coord.x, y: coord.y + 1 }))
    ) {
      bCoords.forEach(coord => {
        gridBoxes[toArrIndex(coord)].classList.remove("active")
        gridBoxes[toArrIndex(coord)].classList.add("static")
      })
      // Create new falling block
      newBlock = randomBlock(blocks)
      bCoords = newBlock.bCoords
      bName = newBlock.bName
    } else {
      removePrevBlock(bCoords)
      // Make block "fall"
      bCoords = bCoords.map(coord => ({ x: coord.x, y: coord.y + 1 }))
    }

    if (!gameEnd) renderBlock(grid, bCoords)
  }, settings.speed)
  // UPDATE controls
  setInterval(() => {
    if (blockAction.move === "left") {
      removePrevBlock(bCoords)
      bCoords = bCoords.map(coord => ({
        x:
          // Stop moving if a box have x=0
          bCoords.some(coord => coord.x === 0) ||
          // Stop moving if there is a static box
          bCoords.some(coord => isBoxStatic({ x: coord.x - 1, y: coord.y + 1 }))
            ? coord.x
            : coord.x - 1,
        y: coord.y,
      }))
      renderBlock(grid, bCoords)
    }
    if (blockAction.move === "right") {
      removePrevBlock(bCoords)
      bCoords = bCoords.map(coord => ({
        x:
          bCoords.some(coord => coord.x === cols - 1) ||
          bCoords.some(coord => isBoxStatic({ x: coord.x + 1, y: coord.y + 1 }))
            ? coord.x
            : coord.x + 1,
        y: coord.y,
      }))
      renderBlock(grid, bCoords)
    }

    // Rotation
    if (
      blockAction.rotate &&
      bName !== "O" &&
      countOccurrences(bCoords, 0) < 2 &&
      countOccurrences(bCoords, cols - 1) < 2
    ) {
      const rotatedBlock = bCoords.map(coord =>
        rotateBox(90, coord, { x: bCoords[2].x, y: bCoords[2].y })
      )

      // Rotate if computed rotation have no static class
      if (
        !rotatedBlock.some(coord => isBoxStatic({ x: coord.x, y: coord.y }))
      ) {
        removePrevBlock(bCoords)
        bCoords = rotatedBlock
      }

      renderBlock(grid, bCoords)
    }

    // TODO: Speed up fall when down is pressed

    // If first row have static blocks, end game
    for (let i = 0; i < cols; i++) {
      if (gridBoxes[i].classList.contains("static")) {
        gameEnd = true
        console.log("GAME END!")
        break
      }
    }

    blockAction.reset()
  }, 200)
}
// controls(blockAction)
// game()

// UI & game start
// document.querySelectorAll(".modal-btn").forEach(btn => {
//   startBtn.style.display = "grid"
//   restartBtn.style.display = "none"
//   btn.addEventListener("click", e => {
//     const btn = e.currentTarget

//     if (btn.value === "start") {
//       modal.style.display = "none"
//       // controls(snek)
//       game()
//     } else if (btn.value === "restart") {
//       window.location.reload()
//     }
//   })
// })
