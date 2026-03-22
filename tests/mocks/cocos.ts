/**
 * Cocos Creator API Mock for Testing
 * 仅包含测试所需的最小 API 模拟
 */

// 模拟装饰器
export function ccclass(name: string) {
  return function (target: any) {
    return target;
  };
}

export function property(options?: any) {
  return function (target: any, key: string) {
    // 空实现
  };
}

export function executeInEditMode(enabled: boolean) {
  return function (target: any) {
    return target;
  };
}

// 模拟 Component
export class Component {
  node: Node = new Node();
  
  onLoad() {}
  start() {}
  update(dt: number) {}
  onDestroy() {}
  
  schedule(callback: Function, interval: number) {}
  unschedule(callback: Function) {}
}

// 模拟 Node
export class Node {
  name: string = '';
  active: boolean = true;
  parent: Node | null = null;
  children: Node[] = [];
  
  private components: Component[] = [];
  
  constructor(name?: string) {
    this.name = name || 'Node';
  }
  
  addComponent<T extends Component>(componentClass: new () => T): T {
    const comp = new componentClass();
    (comp as any).node = this;
    this.components.push(comp);
    return comp;
  }
  
  getComponent<T extends Component>(componentClass: new () => T): T | null {
    return this.components.find(c => c instanceof componentClass) as T || null;
  }
  
  addChild(child: Node): void {
    child.parent = this;
    this.children.push(child);
  }
  
  removeAllChildren(): void {
    this.children.forEach(c => c.parent = null);
    this.children = [];
  }
  
  getChildByName(name: string): Node | null {
    return this.children.find(c => c.name === name) || null;
  }
  
  on(event: string, callback: Function, target?: any) {}
  off(event: string, callback: Function, target?: any) {}
  
  setPosition(pos: Vec3): void {}
  getPosition(): Vec3 { return new Vec3(); }
  destroy(): void {}
}

// 模拟 Vec3
export class Vec3 {
  x: number = 0;
  y: number = 0;
  z: number = 0;
  
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  set(x: number, y: number, z: number = 0): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

// 模拟 Vec2
export class Vec2 {
  x: number = 0;
  y: number = 0;
  
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
  
  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}

// 模拟 Color
export class Color {
  r: number = 255;
  g: number = 255;
  b: number = 255;
  a: number = 255;
  
  constructor(r: number = 255, g: number = 255, b: number = 255, a: number = 255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}

// 模拟 Graphics
export class Graphics extends Component {
  fillColor: Color = new Color();
  strokeColor: Color = new Color();
  lineWidth: number = 1;
  
  clear(): void {}
  rect(x: number, y: number, w: number, h: number): void {}
  circle(x: number, y: number, r: number): void {}
  fill(): void {}
  stroke(): void {}
}

// 模拟 Sprite
export class Sprite extends Component {
  sizeMode: number = 0;
  color: Color = new Color();
}

// 模拟 Label
export class Label extends Component {
  string: string = '';
}

// 模拟 UITransform
export class UITransform extends Component {
  setContentSize(w: number, h: number): void {}
  getContentSize(): { width: number; height: number } {
    return { width: 100, height: 100 };
  }
}

// 模拟 Prefab
export class Prefab {}

// 模拟 instantiate
export function instantiate(prefab: Prefab | Node): Node {
  return new Node('cloned');
}

// 模拟 resources
export const resources = {
  load: (path: string, type: any, callback: Function) => {
    callback(null, null);
  }
};

// 模拟 input
export const input = {
  on: (event: string, callback: Function, target?: any) => {},
  off: (event: string, callback: Function, target?: any) => {}
};

export const Input = {
  EventType: {
    KEY_DOWN: 'key-down',
    KEY_UP: 'key-up',
    TOUCH_START: 'touch-start',
    TOUCH_MOVE: 'touch-move',
    TOUCH_END: 'touch-end'
  }
};

export const KeyCode = {
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  KEY_A: 65,
  KEY_D: 68,
  KEY_W: 87,
  KEY_S: 83,
  SPACE: 32,
  ESCAPE: 27,
  KEY_P: 80
};

export const EventKeyboard = {
  prototype: {}
};

export const EventTouch = {
  prototype: {}
};

// Sprite SizeMode enum
export const SpriteSizeMode = {
  CUSTOM: 0
};
