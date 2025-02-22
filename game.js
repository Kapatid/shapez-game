// @ts-check
import { getGridData, rotateBox } from "./others.js"
import tetrominoes from "./tetrominoes.js"
import "./typedefs.js"

let settings = { fallSpeed: 1000, border: true }

// UI
const scoreDiv = document.getElementById("score")
const modal = document.getElementById("modal")
// Apparently getElementById returns HTMLElement but
// getElementsByClassName only returns Element
const startBtn = /** @type {HTMLButtonElement} */ (modal.querySelectorAll(
  ".modal-btn"
)[0])
const restartBtn = /** @type {HTMLButtonElement} */ (modal.querySelectorAll(
  ".modal-btn"
)[1])

// Get grid and populate it with boxes
const grid = document.getElementById("grid")
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
 * @param {Coordinates} coords
 */
const toArrIndex = ({ x, y }) => y * cols + x

/** @param {Tetromino} tetromino */
const renderBlock = tetromino =>
  tetromino.forEach(coord => {
    grid.children[toArrIndex(coord)].classList.add("active")
  })

/**
 * Remove previously rendered block
 * @param {Tetromino} tetromino
 */
const removePrevBlock = tetromino =>
  tetromino.map(coord =>
    gridBoxes[toArrIndex(coord)].classList.remove("active")
  )

/** @param {Coordinates} coord */
const isBoxStatic = coord =>
  gridBoxes[toArrIndex(coord)].classList.contains("static")

/**
 * @param { tetrominoes } tetrominoes
 * @returns {{tetromino: Tetromino, name: string}}
 * */
const randomBlock = tetrominoes => {
  const coords = Object.values(tetrominoes)
  const randomNum = Math.floor(Math.random() * coords.length)
  const name = Object.keys(tetrominoes)[randomNum]
  return {
    tetromino: coords[randomNum].map(coord => ({
      x:
        name === "O" // Move block to center
          ? coord.x + Math.floor(cols / 2 - 1)
          : coord.x + Math.floor(cols / 2 - 2),
      y: coord.y,
    })),
    name: name,
  }
}

/**
 * Check if there are any completed lines
 * @param { Tetromino } tetromino
 */
const checkLines = tetromino => {
  // Get lowest y of current block that hit a static box/last row
  const lowestRow = tetromino.reduce((prev, current) =>
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
    const score = parseInt(scoreDiv.textContent.replace("Score: ", ""))
    scoreDiv.textContent = `Score: ${score + 100 * rowsRemoved}`
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
  let newBlock = randomBlock(tetrominoes)
  let { tetromino, name } = newBlock

  renderBlock(tetromino)

  const makeBlockFall = () => {
    if (
      // If last row is reached
      tetromino.some(coord => coord.y >= rows - 1) ||
      // If falling block hit another block
      tetromino.some(coord => isBoxStatic({ x: coord.x, y: coord.y + 1 }))
    ) {
      // Make current block static
      tetromino.forEach(coord => {
        gridBoxes[toArrIndex(coord)].classList.remove("active")
        gridBoxes[toArrIndex(coord)].classList.add("static")
      })
      checkLines(tetromino)
      // Create new falling block
      newBlock = randomBlock(tetrominoes)
      tetromino = newBlock.tetromino
      name = newBlock.name
    } else {
      removePrevBlock(tetromino)
      // Make block "fall"
      tetromino = tetromino.map(coord => ({ x: coord.x, y: coord.y + 1 }))
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

    renderBlock(tetromino)
  }

  // UPDATE fall
  setInterval(() => {
    if (gameEnd) return
    makeBlockFall()
  }, settings.fallSpeed)

  // CONTROLS listener
  window.addEventListener("keydown", ({ code }) => {
    if (gameEnd) return

    if (code === "KeyR" && name !== "O") {
      const rotatedBlock = tetromino.map(coord =>
        rotateBox(90, coord, { x: tetromino[1].x, y: tetromino[1].y })
      )

      // Rotate only if computed rotation have NO static class &
      // does not exceed the left & right of the grid
      if (
        !rotatedBlock.some(coord => isBoxStatic({ x: coord.x, y: coord.y })) &&
        !rotatedBlock.some(coord => coord.x < 0) &&
        !rotatedBlock.some(coord => coord.x > cols - 1)
      ) {
        removePrevBlock(tetromino)
        tetromino = rotatedBlock
        renderBlock(tetromino)
      }
    }

    if (code === "KeyS" || code === "ArrowDown") {
      makeBlockFall()
    }

    if (code === "KeyA" || code === "ArrowLeft") {
      removePrevBlock(tetromino)
      tetromino = tetromino.map(coord => ({
        x:
          // Stop moving if a box have x=0
          tetromino.some(coord => coord.x === 0) ||
          // Stop moving if there is a static box
          tetromino.some(coord =>
            isBoxStatic({ x: coord.x - 1, y: coord.y + 1 })
          )
            ? coord.x
            : coord.x - 1,
        y: coord.y,
      }))
      renderBlock(tetromino)
    }

    if (code === "KeyD" || code === "ArrowRight") {
      removePrevBlock(tetromino)
      tetromino = tetromino.map(coord => ({
        x:
          tetromino.some(coord => coord.x === cols - 1) ||
          tetromino.some(coord =>
            isBoxStatic({ x: coord.x + 1, y: coord.y + 1 })
          )
            ? coord.x
            : coord.x + 1,
        y: coord.y,
      }))
      renderBlock(tetromino)
    }
  })
}

// UI & game start
document.querySelectorAll(".modal-btn").forEach(btn => {
  startBtn.style.display = "grid"
  restartBtn.style.display = "none"
  btn.addEventListener("click", e => {
    const currBtn = /** @type {HTMLButtonElement} */ (e.target)

    if (currBtn.value === "start") {
      modal.style.display = "none"
      game()
    } else if (currBtn.value === "restart") {
      window.location.reload()
    }
  })
})
