import { controls, getGridData } from "./others.js"
import blocks from "./blocks.js"

let settings = { speed: 200, border: true }

// Get grid and populate it with boxes
const grid = document.querySelector("#grid")
const gridBoxes = grid.children
const box = document.createElement("div")
box.classList.add("box")
for (let i = 0; i < 160; i++) {
  grid.appendChild(box.cloneNode())
}

const { cols, rows } = getGridData()
let gameEnd = false
let player = { movement: "idle" }

/** From xy coords to array index. (row * width) + column */
const toArrIndex = ({ x, y }) => y * cols + x

/** @returns {{ x: number, y: number}[]} */
const randomBlock = blocks => {
  const values = Object.values(blocks)
  return values[Math.floor(Math.random() * values.length)]
}
/**
 * @param {HTMLElement} gridDiv
 * @param {{x: number, y: number}[]} block
 */
const renderBlock = (gridDiv, block) => {
  // If first row have static blocks, end game
  for (let i = 0; i < cols; i++) {
    if (gridBoxes[i].classList.contains("static")) {
      gameEnd = true
      console.log("GAME END!")
      break
    }
  }
  if (!gameEnd) {
    block.forEach(coord => {
      gridDiv.children[toArrIndex(coord)].classList.add("active")
    })
  }
}
/**
 * @param {{ x: number, y: number}[]} block
 * @returns {{ x: number, y: number}[]}
 */
const centerBlock = block =>
  block.map(coord => ({
    x: coord.x + Math.floor(cols / 2 - 2),
    y: coord.y,
  }))

function game() {
  // START
  let currBlock = centerBlock(randomBlock(blocks))
  renderBlock(grid, currBlock)

  // UPDATE
  setInterval(() => {
    if (gameEnd) return

    if (
      currBlock.some(coord => coord.y >= rows - 1) ||
      currBlock.some(coord =>
        gridBoxes[
          toArrIndex({ x: coord.x, y: coord.y + 1 })
        ].classList.contains("static")
      )
    ) {
      // When falling block hit another block
      // Repalce class
      currBlock.forEach(coord => {
        gridBoxes[toArrIndex(coord)].classList.remove("active")
        gridBoxes[toArrIndex(coord)].classList.add("static")
      })
      // Create new block
      currBlock = centerBlock(randomBlock(blocks))
    } else {
      // Else keep falling
      currBlock.map(coord =>
        gridBoxes[toArrIndex(coord)].classList.remove("active")
      )

      if (player.movement === "left") {
        currBlock = currBlock.map(coord => ({
          x:
            // Stop moving on x axis if computed x goes outside the current row
            currBlock[0].x - 1 < 0 ||
            // Stop moving on x axis if there is a static box
            currBlock.some(coord =>
              gridBoxes[
                toArrIndex({ x: coord.x - 1, y: coord.y + 1 })
              ].classList.contains("static")
            )
              ? coord.x
              : coord.x - 1,
          y: coord.y,
        }))
      } else if (player.movement === "right") {
        currBlock = currBlock.map(coord => ({
          x:
            currBlock[3].x + 1 > cols - 1 ||
            currBlock.some(coord =>
              gridBoxes[
                toArrIndex({ x: coord.x + 1, y: coord.y + 1 })
              ].classList.contains("static")
            )
              ? coord.x
              : coord.x + 1,
          y: coord.y,
        }))
      }

      currBlock = currBlock.map(coord => ({ x: coord.x, y: coord.y + 1 }))

      player.movement = "idle"
    }
    renderBlock(grid, currBlock)
  }, settings.speed)
}
controls(player)
game()

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
