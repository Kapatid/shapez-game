import { getGridData, rotateBox } from "./others.js"
import blocks from "./blocks.js"

let settings = { fallSpeed: 1000, border: true }

// UI
const scoreDiv = document.getElementById("score")
const modal = document.querySelector(".modal")
const startBtn = modal.querySelectorAll(".modal-btn")[0]
const restartBtn = modal.querySelectorAll(".modal-btn")[1]

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

/**
 * From xy coords to array index. (row * width) + column
 * @param {{ x: number, y: number }} coords
 * @param {number} columns
 */
const toArrIndex = ({ x, y }) => y * cols + x

/**
 * @param {HTMLElement} gridDiv
 * @param {{x: number, y: number}[]} bCoords
 */
const renderBlock = bCoords =>
  bCoords.forEach(coord => {
    grid.children[toArrIndex(coord)].classList.add("active")
  })

/**
 * Remove previously rendered block
 * @param {{ x: number; y: number;}[]} blockCoordinates
 */
const removePrevBlock = bCoords =>
  bCoords.map(coord => gridBoxes[toArrIndex(coord)].classList.remove("active"))

/**
 * @param {{ x: number, y: number}} coord
 */
const isBoxStatic = coord =>
  gridBoxes[toArrIndex(coord)].classList.contains("static")

/**
 * @param {[{ x: number, y: number }][]} blocks
 * @param {number} columns
 * @returns {{bCoords: { x: number, y: number }[], bName: string}}}
 * */
const randomBlock = blocks => {
  const coords = Object.values(blocks)
  const randomNum = Math.floor(Math.random() * coords.length)
  const name = Object.keys(blocks)[randomNum]
  return {
    bCoords: coords[randomNum].map(coord => ({
      x:
        name === "O" // Move block to center
          ? coord.x + Math.floor(cols / 2 - 1)
          : coord.x + Math.floor(cols / 2 - 2),
      y: coord.y,
    })),
    bName: name,
  }
}

/**
 * @param {{ x: number, y: number }[]} bCoords
 */
const checkLines = bCoords => {
  // Get static box coords that have the lowest y
  const lowestRow = bCoords.reduce((prev, current) =>
    prev.y > current.y ? prev : current
  )
  let clearRow = false
  let rowsRemoved = 0

  // ROWS
  for (let i = lowestRow.y; i >= 0; i--) {
    // COLUMNS
    // If all boxes in a row is static, start clearing
    for (let j = 0; j < cols; j++) {
      if (isBoxStatic({ x: j, y: i })) {
        clearRow = true
      } else {
        clearRow = false
        break
      }
    }

    if (clearRow) {
      // COLUMNS
      // Start removing static classes of boxes
      for (let k = 0; k < cols; k++) {
        gridBoxes[toArrIndex({ x: k, y: i })].classList.remove("static")
      }
      rowsRemoved += 1
    }
  }

  if (rowsRemoved !== 0) {
    scoreDiv.textContent = `Score: ${100 * rowsRemoved}`
    // Starting from bottom, make all static boxes fall
    for (let i = toArrIndex(lowestRow); i >= 0; i--) {
      if (gridBoxes[i].classList.contains("static")) {
        gridBoxes[i].classList.remove("static")
        // Fall based on number of lines removed
        gridBoxes[cols * rowsRemoved + i].classList.add("static")
      }
    }
  }
}

function game() {
  // START
  let newBlock = randomBlock(blocks)
  let { bCoords, bName } = newBlock

  renderBlock(bCoords)

  const makeBlockFall = () => {
    if (
      // If last row is reached
      bCoords.some(coord => coord.y >= rows - 1) ||
      // If falling block hit another block
      bCoords.some(coord => isBoxStatic({ x: coord.x, y: coord.y + 1 }))
    ) {
      // Make current block static
      bCoords.forEach(coord => {
        gridBoxes[toArrIndex(coord)].classList.remove("active")
        gridBoxes[toArrIndex(coord)].classList.add("static")
      })
      checkLines(bCoords)
      // Create new falling block
      newBlock = randomBlock(blocks)
      bCoords = newBlock.bCoords
      bName = newBlock.bName
    } else {
      removePrevBlock(bCoords)
      // Make block "fall"
      bCoords = bCoords.map(coord => ({ x: coord.x, y: coord.y + 1 }))
    }

    // If first row have static blocks, end game
    for (let i = 0; i < cols; i++) {
      if (gridBoxes[i].classList.contains("static")) {
        gameEnd = true
        startBtn.style.display = "none"
        restartBtn.style.display = "grid"
        modal.querySelectorAll("p").forEach(e => (e.style.display = "none"))
        modal.querySelector("h1").textContent = "GAME OVER 🙁"
        modal.style.display = "grid"
        break
      }
    }

    renderBlock(bCoords)
  }

  // UPDATE fall
  setInterval(() => {
    if (gameEnd) return
    makeBlockFall()
  }, settings.fallSpeed)

  // CONTROLS listener
  window.addEventListener("keydown", ({ code }) => {
    if (gameEnd) return

    if (code === "KeyR" && bName !== "O") {
      const rotatedBlock = bCoords.map(coord =>
        rotateBox(90, coord, { x: bCoords[1].x, y: bCoords[1].y })
      )

      // Rotate only if computed rotation have NO static class &
      // does not exceed the left & right of the grid
      if (
        !rotatedBlock.some(coord => isBoxStatic({ x: coord.x, y: coord.y })) &&
        !rotatedBlock.some(coord => coord.x < 0) &&
        !rotatedBlock.some(coord => coord.x > cols - 1)
      ) {
        removePrevBlock(bCoords)
        bCoords = rotatedBlock
        renderBlock(bCoords)
      }
    }

    if (code === "KeyS" || code === "ArrowDown") {
      makeBlockFall()
    }

    if (code === "KeyA" || code === "ArrowLeft") {
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
      renderBlock(bCoords)
    }

    if (code === "KeyD" || code === "ArrowRight") {
      removePrevBlock(bCoords)
      bCoords = bCoords.map(coord => ({
        x:
          bCoords.some(coord => coord.x === cols - 1) ||
          bCoords.some(coord => isBoxStatic({ x: coord.x + 1, y: coord.y + 1 }))
            ? coord.x
            : coord.x + 1,
        y: coord.y,
      }))
      renderBlock(bCoords)
    }
  })
}

// UI & game start
document.querySelectorAll(".modal-btn").forEach(btn => {
  startBtn.style.display = "grid"
  restartBtn.style.display = "none"
  btn.addEventListener("click", e => {
    const btn = e.currentTarget

    if (btn.value === "start") {
      modal.style.display = "none"
      game()
    } else if (btn.value === "restart") {
      window.location.reload()
    }
  })
})
