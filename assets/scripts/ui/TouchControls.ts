/**
 * 双色胶囊 - 触摸控制
 * 移动端触摸/点击控制
 */

import { _decorator, Component, Node, EventTouch, Vec2 } from 'cc';
import { GameManager } from '../managers/GameManager';

const { ccclass, property } = _decorator;

@ccclass('TouchControls')
export class TouchControls extends Component {
    @property(GameManager)
    gameManager: GameManager | null = null;
    
    @property(Node)
    leftButton: Node | null = null;
    
    @property(Node)
    rightButton: Node | null = null;
    
    @property(Node)
    rotateButton: Node | null = null;
    
    @property(Node)
    downButton: Node | null = null;
    
    @property(Node)
    dropButton: Node | null = null;
    
    // 滑动检测
    private touchStartPos: Vec2 = new Vec2();
    private isSwiping: boolean = false;
    private swipeThreshold: number = 30;
    
    onLoad() {
        this.setupButtons();
        this.setupSwipe();
    }
    
    // 设置按钮事件
    private setupButtons(): void {
        // 左移
        this.leftButton?.on(Node.EventType.TOUCH_START, () => {
            this.gameManager?.onTouchLeft();
        }, this);
        
        // 右移
        this.rightButton?.on(Node.EventType.TOUCH_START, () => {
            this.gameManager?.onTouchRight();
        }, this);
        
        // 旋转
        this.rotateButton?.on(Node.EventType.TOUCH_START, () => {
            this.gameManager?.onTouchRotate();
        }, this);
        
        // 下落（按住持续下落）
        this.downButton?.on(Node.EventType.TOUCH_START, () => {
            this.gameManager?.onTouchDown();
        }, this);
        this.downButton?.on(Node.EventType.TOUCH_END, () => {
            this.gameManager?.onTouchUp();
        }, this);
        this.downButton?.on(Node.EventType.TOUCH_CANCEL, () => {
            this.gameManager?.onTouchUp();
        }, this);
        
        // 硬降
        this.dropButton?.on(Node.EventType.TOUCH_START, () => {
            this.gameManager?.onTouchDrop();
        }, this);
    }
    
    // 设置滑动控制
    private setupSwipe(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    
    private onTouchStart(event: EventTouch): void {
        const pos = event.getUILocation();
        this.touchStartPos.set(pos.x, pos.y);
        this.isSwiping = false;
    }
    
    private onTouchMove(event: EventTouch): void {
        if (this.isSwiping) return;
        
        const pos = event.getUILocation();
        const dx = pos.x - this.touchStartPos.x;
        const dy = pos.y - this.touchStartPos.y;
        
        // 水平滑动
        if (Math.abs(dx) > this.swipeThreshold && Math.abs(dx) > Math.abs(dy)) {
            this.isSwiping = true;
            if (dx > 0) {
                this.gameManager?.onTouchRight();
            } else {
                this.gameManager?.onTouchLeft();
            }
        }
        
        // 下滑加速
        if (dy < -this.swipeThreshold && Math.abs(dy) > Math.abs(dx)) {
            this.isSwiping = true;
            this.gameManager?.onTouchDown();
        }
    }
    
    private onTouchEnd(event: EventTouch): void {
        if (this.isSwiping) {
            this.gameManager?.onTouchUp();
            return;
        }
        
        // 点击旋转
        const pos = event.getUILocation();
        const dx = pos.x - this.touchStartPos.x;
        const dy = pos.y - this.touchStartPos.y;
        
        // 小范围点击 = 旋转
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            this.gameManager?.onTouchRotate();
        }
    }
    
    // 显示/隐藏控制按钮
    public show(): void {
        this.node.active = true;
    }
    
    public hide(): void {
        this.node.active = false;
    }
}
