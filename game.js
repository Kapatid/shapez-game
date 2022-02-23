import { controls, getGridData } from "./others.js"
import blocks from "./blocks.js"

let settings = { speed: 250, border: true }

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
let boxAction = { move: "idle", rotate: false }

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
const renderBlock = (gridDiv, block) =>
  block.forEach(coord => {
    gridDiv.children[toArrIndex(coord)].classList.add("active")
  })
/**
 * @param {{ x: number, y: number}[]} block
 * @returns {{ x: number, y: number}[]}
 */
const centerBlock = block =>
  block.map(coord => ({
    x: coord.x + Math.floor(cols / 2 - 2),
    y: coord.y,
  }))
/**
 * @param {{ x: number, y: number}} coord
 * @returns {boolean}
 */
const nextBoxStatic = coord =>
  gridBoxes[toArrIndex(coord)].classList.contains("static")

/**
 * Source: https://stackoverflow.com/a/7102110
 * @param {number} degree
 * @param {{ x: number, y: number }} coord
 * @param {{ x: number, y: number }} origin - Center of rotation
 * @returns
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
  let currBlock = centerBlock(randomBlock(blocks))
  renderBlock(grid, currBlock)

  // UPDATE
  setInterval(() => {
    if (gameEnd) return

    if (
      // If last row is reached
      currBlock.some(coord => coord.y >= rows - 1) ||
      // If falling block hit another block repalce class
      currBlock.some(coord => nextBoxStatic({ x: coord.x, y: coord.y + 1 }))
    ) {
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

      if (boxAction.move === "left") {
        currBlock = currBlock.map(coord => ({
          x:
            // Stop moving x axis if computed x goes outside the current row
            currBlock[0].x - 1 < 0 ||
            // Stop moving x axis if there is a static box
            // FIX: Not viable if block is rotated
            currBlock.some(coord =>
              nextBoxStatic({ x: coord.x - 1, y: coord.y + 1 })
            )
              ? coord.x
              : coord.x - 1,
          y: coord.y,
        }))
      } else if (boxAction.move === "right") {
        currBlock = currBlock.map(coord => ({
          x:
            currBlock[3].x + 1 > cols - 1 ||
            currBlock.some(coord =>
              nextBoxStatic({ x: coord.x + 1, y: coord.y + 1 })
            )
              ? coord.x
              : coord.x + 1,
          y: coord.y,
        }))
      }

      // TODO: Prevent rotate if surrounding blocks are static
      if (boxAction.rotate) {
        currBlock = currBlock.map(coord =>
          rotateBox(90, coord, { x: currBlock[1].x, y: currBlock[1].y })
        )
        boxAction.rotate = false
      }

      currBlock = currBlock.map(coord => ({ x: coord.x, y: coord.y + 1 }))

      boxAction.move = "idle"
    }

    // If first row have static blocks, end game
    for (let i = 0; i < cols; i++) {
      if (gridBoxes[i].classList.contains("static")) {
        gameEnd = true
        console.log("GAME END!")
        break
      }
    }
    if (!gameEnd) renderBlock(grid, currBlock)
  }, settings.speed)
}
// controls(boxAction)
// game()
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
