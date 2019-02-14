import { WindowStates, GWL, HWND, SWP } from "../constants"

const addon = require("bindings")("windows-window-manager");

export interface Position {
    left: number;
    top: number;
}

export interface Bounds extends Position {
    right: number;
    bottom: number;
}

type Dimensions = { width: number; height: number };

const WEIRD_OFFSET = -7
const TASKBAR_HEIGHT = 34

export class Window {
    public handle: number;
    private screenDimensions: Dimensions = null;

    constructor(windowHandle: number) {
		this.handle = windowHandle;
	}
	
	private checkDim() {
		if (!this.screenDimensions) {
			throw new Error("screenDimensions not set, please use setScreenDimensions to give informations about your screen size.")
		}
	}
	
	/** SCREEN */

    public setScreenDimension({ width, height }: Dimensions) {
        this.screenDimensions = {
            width,
            height: height
        };
	}

	private get thirdScreenHeight(): number {
		return Math.floor(this.screenDimensions.height / 3)
	}

	private get thirdScreenWidth(): number {
		return Math.floor(this.screenDimensions.width / 3) 
	}

	private addScreenOffset(left: number) {
		const { left: currentLeft } = this.getBounds()
		const screenNumber =  Math.floor((currentLeft - WEIRD_OFFSET) / this.screenDimensions.width)
		return left + (this.screenDimensions.width * screenNumber)
	}

	/** DIMENSIONS */

	// Top
	private get topVerticalDimension(): { height: number, top: number } {
		return {
			height: this.thirdScreenHeight, top: 0
		}
	}
	// Mid
	private get midHeight(): number {
		return this.thirdScreenHeight - WEIRD_OFFSET
	}

	private get midTopOffset(): number {
		return this.thirdScreenHeight + WEIRD_OFFSET
	}

	private get midVerticalDimension(): { height: number, top: number } {
		return {
			height: this.midHeight, top: this.midTopOffset
		}
	}

	private get midHorizontalDimension(): { left: number, width: number }  {
		return {
			width: this.thirdScreenWidth, left: this.addScreenOffset(this.thirdScreenWidth)
		}
	}
	// Bottom
	private get bottomHeight(): number {
		return this.thirdScreenHeight - TASKBAR_HEIGHT - WEIRD_OFFSET
	}

	private get bottomTopOffset(): number {
		return (this.thirdScreenHeight * 2) + WEIRD_OFFSET
	}

	private get bottomVerticalDimension(): { height: number, top: number } {
		return {
			height: this.bottomHeight, top: this.bottomTopOffset
		}
	}

	// LEFT
	private get leftHorizontalDimension(): { left: number, width: number }  {
		return {
			left: this.addScreenOffset(WEIRD_OFFSET),
			width: this.thirdScreenWidth + (WEIRD_OFFSET * -3)
		}
	}

	// RIGHT
	private get rightHorizontalDimension():  { left: number, width: number }  {
		return {
			left: this.addScreenOffset(Math.floor(this.thirdScreenWidth * 2) + (WEIRD_OFFSET * 2)),
			width: this.thirdScreenWidth + (WEIRD_OFFSET * -3)
		}
	}


	/** MOVES */

	// Mid
	public clipMidTop() {
		this.checkDim()
		this.move({ ...this.midHorizontalDimension, ...this.topVerticalDimension })
	}

	public clipMid() {
		this.checkDim()
		const origin = this.getBounds()
		const target = { ...this.midHorizontalDimension, ...this.midVerticalDimension }

		if (JSON.stringify({ width: this.getWidth(), left: origin.left, height: this.getHeight(), top: origin.top }) === JSON.stringify(target)) {
			this.maximize()
		} else {
			this.move(target)
		}

	}
	
	public clipMidBottom() {
		this.checkDim()
		this.move({ ...this.midHorizontalDimension, ...this.bottomVerticalDimension })
	}
	
	// Left
	public clipTopLeft() {
		this.checkDim()
		this.move({ ...this.leftHorizontalDimension, ...this.topVerticalDimension })
	}

	public clipMidLeft() {
		this.checkDim()
		this.move({ ...this.leftHorizontalDimension, ...this.midVerticalDimension })
	}

	public clipBottomLeft() {
		this.checkDim()
		this.move({ ...this.leftHorizontalDimension, ...this.bottomVerticalDimension })
	}

	// Right
	public clipTopRight() {
		this.checkDim()
		this.move({ ...this.rightHorizontalDimension, ...this.topVerticalDimension })
	}

	public clipMidRight() {
		this.checkDim()
		this.move({ ...this.rightHorizontalDimension, ...this.midVerticalDimension })
	}

	public clipBottomRight() {
		this.checkDim()
		this.move({ ...this.rightHorizontalDimension, ...this.bottomVerticalDimension })
	}

    getBounds(): Bounds {
        return addon.getWindowBounds(this.handle);
    }

    setPosition({ left, top }: Position) {
        const width = this.getWidth();
        const height = this.getHeight();
        addon.setWindowPos(this.handle, 0, left, top, width, height, 0);
    }

    setBounds() {
        const width = this.getWidth();
        const height = this.getHeight();
        addon.setWindowPos(this.handle, 0, 1273, 0, width, height, 0);
    }

    getTitle() {
        return addon.getWindowTitle(this.handle);
    }

    getWidth() {
        const bounds = this.getBounds();
        return bounds.right - bounds.left;
    }

    getHeight() {
        const bounds = this.getBounds();
        return bounds.bottom - bounds.top;
    }

    getStyle() {
        return addon.getWindowLong(this.handle, GWL.STYLE);
    }

    public move({ height, left, top, width }: Position & Dimensions) {
		this.restore()
        addon.moveWindow(this.handle, left, top, width, height);
    }

    setState(state: number) {
        addon.setWindowState(this.handle, state);
    }

    public show() {
        this.setState(WindowStates.SHOW);
    }

    public hide() {
        this.setState(WindowStates.HIDE);
    }

    public minimize() {
        this.setState(WindowStates.MINIMIZE);
    }

    public restore() {
        this.setState(WindowStates.RESTORE);
    }

    public maximize() {
        this.setState(WindowStates.MAXIMIZE);
    }

    setTopMost(toggle: boolean, uFlags = 0) {
        const { left, top } = this.getBounds();
        const width = this.getWidth();
        const height = this.getHeight();

        addon.setWindowPos(
            this.handle,
            toggle ? HWND.TOPMOST : HWND.NOTOPMOST,
            left,
            top,
            width,
            height,
            uFlags
        );
    }

    setStyle(style: number) {
        const { left, top } = this.getBounds();
        const width = this.getWidth();
        const height = this.getHeight();

        addon.setWindowLong(this.handle, GWL.STYLE, style);

        setTimeout(() => {
            addon.setWindowPos(
                this.handle,
                0,
                left,
                top,
                width,
                height,
                SWP.SHOWWINDOW
            );
        }, 10);
    }
}
