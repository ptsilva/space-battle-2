export class InputManager {
  private keys: Set<string> = new Set();
  private mousePos = { x: 0, y: 0 };
  private touchPos: { x: number; y: number } | null = null;
  private isTouching = false;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      e.preventDefault();
    });

    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;
    });

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isTouching = true;
      this.updateTouchPosition(e);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.isTouching) {
        this.updateTouchPosition(e);
      }
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isTouching = false;
      this.touchPos = null;
    });

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  private updateTouchPosition(e: TouchEvent): void {
    if (e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      this.touchPos = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
  }

  public update(): void {
    // Input state is updated by event listeners
  }

  public isMovingLeft(): boolean {
    return this.keys.has('KeyA') || this.keys.has('ArrowLeft');
  }

  public isMovingRight(): boolean {
    return this.keys.has('KeyD') || this.keys.has('ArrowRight');
  }

  public isMovingUp(): boolean {
    return this.keys.has('KeyW') || this.keys.has('ArrowUp');
  }

  public isMovingDown(): boolean {
    return this.keys.has('KeyS') || this.keys.has('ArrowDown');
  }

  public isShooting(): boolean {
    return this.keys.has('Space');
  }

  public getTouchInput(): { x: number; y: number } | null {
    return this.touchPos;
  }

  public isMobile(): boolean {
    return this.isTouching;
  }
}
