/**
 * 双色胶囊 - 格子渲染器
 * 负责渲染单个格子的外观（胶囊、病毒、空格）
 */

import { _decorator, Component, Sprite, Color, Graphics, UITransform, Vec2 } from 'cc';
import { CELL_SIZE, CapsuleColor, COLOR_MAP } from '../core/Constants';

const { ccclass, property, executeInEditMode } = _decorator;

// 格子类型
enum CellType {
    EMPTY,
    VIRUS,
    CAPSULE_LEFT,
    CAPSULE_RIGHT,
    CAPSULE_PREVIEW
}

@ccclass('CellRenderer')
export class CellRenderer extends Component {
    @property(Sprite)
    sprite: Sprite | null = null;
    
    @property(Graphics)
    graphics: Graphics | null = null;
    
    private currentType: CellType = CellType.EMPTY;
    private currentColor: CapsuleColor = CapsuleColor.NONE;
    
    onLoad() {
        // 如果没有组件，自动添加
        if (!this.graphics) {
            this.graphics = this.node.addComponent(Graphics);
        }
        
        // 设置尺寸
        const transform = this.node.getComponent(UITransform);
        if (transform) {
            transform.setContentSize(CELL_SIZE - 2, CELL_SIZE - 2);
        }
        
        this.setEmpty();
    }
    
    // 设置为空格
    public setEmpty(): void {
        this.currentType = CellType.EMPTY;
        this.currentColor = CapsuleColor.NONE;
        this.render();
    }
    
    // 设置为病毒
    public setVirus(color: CapsuleColor): void {
        this.currentType = CellType.VIRUS;
        this.currentColor = color;
        this.render();
    }
    
    // 设置为胶囊左半
    public setCapsuleLeft(color: CapsuleColor): void {
        this.currentType = CellType.CAPSULE_LEFT;
        this.currentColor = color;
        this.render();
    }
    
    // 设置为胶囊右半
    public setCapsuleRight(color: CapsuleColor): void {
        this.currentType = CellType.CAPSULE_RIGHT;
        this.currentColor = color;
        this.render();
    }
    
    // 设置预览
    public setCapsulePreview(color: CapsuleColor, isLeft: boolean): void {
        this.currentType = isLeft ? CellType.CAPSULE_LEFT : CellType.CAPSULE_RIGHT;
        this.currentColor = color;
        this.render();
    }
    
    // 渲染
    private render(): void {
        if (!this.graphics) return;
        
        this.graphics.clear();
        
        const size = CELL_SIZE - 2;
        const halfSize = size / 2;
        
        switch (this.currentType) {
            case CellType.EMPTY:
                this.renderEmpty(size, halfSize);
                break;
            case CellType.VIRUS:
                this.renderVirus(size, halfSize);
                break;
            case CellType.CAPSULE_LEFT:
                this.renderCapsuleHalf(size, halfSize, true);
                break;
            case CellType.CAPSULE_RIGHT:
                this.renderCapsuleHalf(size, halfSize, false);
                break;
        }
    }
    
    // 渲染空格
    private renderEmpty(size: number, halfSize: number): void {
        // 空格显示为半透明背景
        this.graphics.fillColor = new Color(255, 255, 255, 30);
        this.graphics.rect(-halfSize, -halfSize, size, size);
        this.graphics.fill();
        
        // 边框
        this.graphics.strokeColor = new Color(200, 200, 200, 50);
        this.graphics.lineWidth = 1;
        this.graphics.rect(-halfSize, -halfSize, size, size);
        this.graphics.stroke();
    }
    
    // 渲染病毒
    private renderVirus(size: number, halfSize: number): void {
        const color = this.getColorValue();
        const radius = halfSize * 0.8;
        
        // 病毒主体（圆形）
        this.graphics.fillColor = color;
        this.graphics.circle(0, 0, radius);
        this.graphics.fill();
        
        // 病毒眼睛
        const eyeOffset = radius * 0.3;
        const eyeRadius = radius * 0.2;
        
        this.graphics.fillColor = new Color(255, 255, 255, 255);
        this.graphics.circle(-eyeOffset, eyeOffset, eyeRadius);
        this.graphics.circle(eyeOffset, eyeOffset, eyeRadius);
        this.graphics.fill();
        
        // 眼珠
        const pupilRadius = eyeRadius * 0.5;
        this.graphics.fillColor = new Color(0, 0, 0, 255);
        this.graphics.circle(-eyeOffset, eyeOffset, pupilRadius);
        this.graphics.circle(eyeOffset, eyeOffset, pupilRadius);
        this.graphics.fill();
        
        // 病毒"触手"（小凸起）
        this.graphics.fillColor = color;
        const tentacleRadius = radius * 0.25;
        const tentacleDist = radius * 0.85;
        
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60) * Math.PI / 180;
            const x = Math.cos(angle) * tentacleDist;
            const y = Math.sin(angle) * tentacleDist;
            this.graphics.circle(x, y, tentacleRadius);
            this.graphics.fill();
        }
    }
    
    // 渲染胶囊半边
    private renderCapsuleHalf(size: number, halfSize: number, isLeft: boolean): void {
        const color = this.getColorValue();
        const width = size;
        const height = size;
        
        // 胶囊主体（圆角矩形）
        this.graphics.fillColor = color;
        
        if (isLeft) {
            // 左半边：左圆 + 矩形
            this.graphics.circle(-halfSize + halfSize * 0.5, 0, halfSize * 0.9);
            this.graphics.fill();
            this.graphics.rect(-halfSize + halfSize * 0.3, -halfSize * 0.9, halfSize, halfSize * 1.8);
            this.graphics.fill();
        } else {
            // 右半边：矩形 + 右圆
            this.graphics.circle(halfSize - halfSize * 0.5, 0, halfSize * 0.9);
            this.graphics.fill();
            this.graphics.rect(-halfSize, -halfSize * 0.9, halfSize * 0.7, halfSize * 1.8);
            this.graphics.fill();
        }
        
        // 高光效果
        this.graphics.fillColor = new Color(255, 255, 255, 80);
        if (isLeft) {
            this.graphics.circle(-halfSize * 0.3, halfSize * 0.3, halfSize * 0.3);
            this.graphics.fill();
        } else {
            this.graphics.circle(halfSize * 0.3, halfSize * 0.3, halfSize * 0.3);
            this.graphics.fill();
        }
        
        // 边框（连接处不加边框）
        this.graphics.strokeColor = new Color(0, 0, 0, 50);
        this.graphics.lineWidth = 2;
    }
    
    // 获取颜色值
    private getColorValue(): Color {
        const hex = COLOR_MAP[this.currentColor];
        return this.hexToColor(hex);
    }
    
    // Hex 转 Color
    private hexToColor(hex: string): Color {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return new Color(
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16),
                255
            );
        }
        return new Color(255, 255, 255, 255);
    }
}
