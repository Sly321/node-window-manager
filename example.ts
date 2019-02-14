import { windowsManager, Window } from "./src/index"
import * as Screen from "screen-info"
import * as ioHook from "iohook"

let window: Window

enum KEYS  {
	NUMPAD_9 = 73,
	NUMPAD_8 = 72,
	NUMPAD_7 = 71,
	NUMPAD_6 = 77,
	NUMPAD_5 = 76,
	NUMPAD_4 = 75,
	NUMPAD_3 = 81,
	NUMPAD_2 = 80,
	NUMPAD_1 = 79,
}

ioHook.on("keyup", function(keyPress) {
	if (keyPress.altKey && !keyPress.ctrlKey) {
		if (keyPress.keycode === KEYS.NUMPAD_9) {
			window.clipTopRight()
		}

		if (keyPress.keycode === KEYS.NUMPAD_8) {
			window.clipMidTop()
		}

		if (keyPress.keycode === KEYS.NUMPAD_7) {
			window.clipTopLeft()
		}

		if (keyPress.keycode === KEYS.NUMPAD_6) {
			window.clipMidRight()
		}

		if (keyPress.keycode === KEYS.NUMPAD_5) {
			window.clipMid()
		}

		if (keyPress.keycode === KEYS.NUMPAD_4) {
			window.clipMidLeft()
		}

		if (keyPress.keycode === KEYS.NUMPAD_3) {
			window.clipBottomRight()
		}

		if (keyPress.keycode === KEYS.NUMPAD_2) {
			window.clipMidBottom()
		}

		if (keyPress.keycode === KEYS.NUMPAD_1) {
			window.clipBottomLeft()
		}
	}

	if (keyPress.altKey && keyPress.ctrlKey) {
	}
})

ioHook.start(false)

const screen = (Screen as any).main();
const dim = {
    width: screen.width,
    height: screen.height
};

windowsManager.onActivated.addListener((windowFromManger: Window) => {
	windowFromManger.setScreenDimension(dim)
	window = windowFromManger
})