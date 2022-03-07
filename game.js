import { getGridData, countOccurrences, rotateBox } from "./others.js"
import blocks from "./blocks.js"

let settings = { fallSpeed: 1000, border: true }

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
 * From xy coords to array index. (row * width) + column
 * @param {{ x: number, y: number }} coords
 * @param {number} columns
 */
const toArrIndex = ({ x, y }) => y * cols + x

/**
 * @param {{ x: number, y: number }[]} blocks
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
        // Move block to center
        name === "O"
          ? coord.x + Math.floor(cols / 2 - 1)
          : coord.x + Math.floor(cols / 2 - 2),
      y: coord.y,
    })),
    bName: name,
  }
}

function game() {
  // START
  let newBlock = randomBlock(blocks)
  let { bCoords, bName } = newBlock

  renderBlock(bCoords)

  const fallBlock = () => {
    if (
      // If last row is reached
      bCoords.some(coord => coord.y >= rows - 1) ||
      // If falling block hit another block repalce class
      bCoords.some(coord => isBoxStatic({ x: coord.x, y: coord.y + 1 }))
    ) {
      // Make current block static
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

    // If first row have static blocks, end game
    for (let i = 0; i < cols; i++) {
      if (gridBoxes[i].classList.contains("static")) {
        gameEnd = true
        console.log("GAME END!")
        break
      }
    }

    renderBlock(bCoords)
  }

  // UPDATE fall
  setInterval(() => {
    if (gameEnd) return
    fallBlock()
  }, settings.fallSpeed)

  // CONTROLS listener
  window.addEventListener("keydown", ({ code }) => {
    if (code === "KeyT" && bName !== "O") {
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
      fallBlock()
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
