import Board from './board';
import { Game } from './game';
import { GUI } from './gui';
import { getImageData, loadImage } from './utils';

async function start() {
  const gui = new GUI()
  const game = new Game(gui, {
    coloniesNumber: 10,
    speed: 10,
    reproductiveThreshold: 100
  })
  const path = gui.getMapPath()
  // const path = 'images/map4.png'
  const image = await loadImage(path)
  const imageData = getImageData(image)
  game.setMap(imageData)
  game.start()
}

start()
