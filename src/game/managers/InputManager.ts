export class InputManager {
  private keys: Set<string> = new Set();
  private mousePos = { x: 0, y: 0 };
  private touchPos: { x: number; y: number } | null = null;
  private isTouching = false;
  private canvas: HTMLCanvasElement;
  private isInputFieldFocused = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
    this.setupInputFieldDetection();
  }

  private setupEventListeners(): void {
    // Keyboard events - only capture when not in input fields
    document.addEventListener('keydown', (e) => {
      // Don't capture keyboard input when user is typing in input fields
      if (this.isInputFieldFocused) {
        return;
      }
      
      this.keys.add(e.code);
      e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
      // Don't capture keyboard input when user is typing in input fields
      if (this.isInputFieldFocused) {
        return;
      }
      
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

  private setupInputFieldDetection(): void {
    // Track when input fields are focused/blurred
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        console.log('Input field focused - disabling game input capture');
        this.isInputFieldFocused = true;
        // Clear any captured keys when input field is focused
        this.keys.clear();
      }
    });

    document.addEventListener('focusout', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        console.log('Input field blurred - enabling game input capture');
        this.isInputFieldFocused = false;
        // Clear keys to prevent stuck keys
        this.keys.clear();
      }
    });

    // Also check for specific input elements that might be added dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const inputs = element.querySelectorAll('input, textarea');
            inputs.forEach((input) => {
              input.addEventListener('focus', () => {
                console.log('Dynamic input focused - disabling game input capture');
                this.isInputFieldFocused = true;
                this.keys.clear();
              });
              input.addEventListener('blur', () => {
                console.log('Dynamic input blurred - enabling game input capture');
                this.isInputFieldFocused = false;
                this.keys.clear();
              });
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
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

  public isInputFocused(): boolean {
    return this.isInputFieldFocused;
  }
}
