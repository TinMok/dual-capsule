/**
 * 双色胶囊 - 动画管理器
 * 负责管理游戏中的各种动画效果
 */

import { _decorator, Component, Node, tween, Vec3, Color, Sprite, UIOpacity } from 'cc';

const { ccclass, property } = _decorator;

export type AnimationCallback = () => void;

@ccclass('AnimationManager')
export class AnimationManager {
    private static instance: AnimationManager;
    
    public static getInstance(): AnimationManager {
        if (!AnimationManager.instance) {
            AnimationManager.instance = new AnimationManager();
        }
        return AnimationManager.instance;
    }
    
    // 消除动画
    public playMatchAnimation(
        node: Node,
        color: string,
        onComplete?: AnimationCallback
    ): void {
        // 放大 -> 缩小 -> 消失
        tween(node)
            .to(0.1, { scale: new Vec3(1.3, 1.3, 1) })
            .to(0.1, { scale: new Vec3(0, 0, 0) })
            .call(() => {
                onComplete?.();
            })
            .start();
    }
    
    // 连击动画
    public playComboAnimation(
        node: Node,
        combo: number,
        position: Vec3
    ): void {
        // 创建连击文字节点（需要外部实现）
        // 放大 -> 弹跳 -> 消失
        tween(node)
            .to(0.1, { scale: new Vec3(1.5, 1.5, 1) })
            .to(0.2, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'backOut' })
            .delay(0.5)
            .to(0.3, { scale: new Vec3(0, 0, 0) })
            .start();
    }
    
    // 胶囊下落动画
    public playFallAnimation(
        node: Node,
        fromY: number,
        toY: number,
        duration: number = 0.1,
        onComplete?: AnimationCallback
    ): void {
        const pos = node.position.clone();
        node.setPosition(pos.x, fromY, pos.z);
        
        tween(node)
            .to(duration, { position: new Vec3(pos.x, toY, pos.z) }, { easing: 'quadOut' })
            .call(() => {
                onComplete?.();
            })
            .start();
    }
    
    // 弹跳效果
    public playBounceAnimation(node: Node): void {
        const originalScale = node.scale.clone();
        
        tween(node)
            .to(0.1, { scale: new Vec3(1.1, 0.9, 1) })
            .to(0.1, { scale: new Vec3(0.9, 1.1, 1) })
            .to(0.1, { scale: originalScale })
            .start();
    }
    
    // 震动效果
    public playShakeAnimation(node: Node, intensity: number = 5): void {
        const originalPos = node.position.clone();
        const shakeCount = 4;
        let count = 0;
        
        const shake = () => {
            if (count >= shakeCount) {
                node.setPosition(originalPos);
                return;
            }
            
            const offsetX = (Math.random() - 0.5) * intensity;
            const offsetY = (Math.random() - 0.5) * intensity;
            
            node.setPosition(
                originalPos.x + offsetX,
                originalPos.y + offsetY,
                originalPos.z
            );
            
            count++;
            setTimeout(shake, 50);
        };
        
        shake();
    }
    
    // 淡入效果
    public playFadeIn(node: Node, duration: number = 0.3): void {
        const opacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
        opacity.opacity = 0;
        
        tween(opacity)
            .to(duration, { opacity: 255 })
            .start();
    }
    
    // 淡出效果
    public playFadeOut(node: Node, duration: number = 0.3, onComplete?: AnimationCallback): void {
        const opacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
        
        tween(opacity)
            .to(duration, { opacity: 0 })
            .call(() => {
                onComplete?.();
            })
            .start();
    }
    
    // 缩放弹入
    public playScaleIn(node: Node, duration: number = 0.3): void {
        node.setScale(0, 0, 1);
        
        tween(node)
            .to(duration, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }
    
    // 缩放弹出
    public playScaleOut(node: Node, duration: number = 0.3, onComplete?: AnimationCallback): void {
        tween(node)
            .to(duration, { scale: new Vec3(0, 0, 0) }, { easing: 'backIn' })
            .call(() => {
                onComplete?.();
            })
            .start();
    }
    
    // 脉冲效果（用于提示）
    public playPulseAnimation(node: Node, times: number = 3): void {
        const originalScale = node.scale.clone();
        let count = 0;
        
        const pulse = () => {
            if (count >= times) {
                node.setScale(originalScale);
                return;
            }
            
            tween(node)
                .to(0.15, { scale: new Vec3(1.15, 1.15, 1) })
                .to(0.15, { scale: originalScale })
                .call(() => {
                    count++;
                    pulse();
                })
                .start();
        };
        
        pulse();
    }
    
    // 胜利动画
    public playVictoryAnimation(nodes: Node[], onComplete?: AnimationCallback): void {
        let completed = 0;
        const total = nodes.length;
        
        nodes.forEach((node, index) => {
            setTimeout(() => {
                tween(node)
                    .to(0.2, { scale: new Vec3(1.3, 1.3, 1) })
                    .to(0.2, { scale: new Vec3(0, 0, 0) })
                    .call(() => {
                        completed++;
                        if (completed >= total) {
                            onComplete?.();
                        }
                    })
                    .start();
            }, index * 50);
        });
    }
    
    // 旋转动画
    public playRotateAnimation(node: Node, duration: number = 0.5): void {
        tween(node)
            .by(duration, { eulerAngles: new Vec3(0, 0, 360) })
            .start();
    }
    
    // 弹跳下落（胶囊落地）
    public playDropBounce(
        node: Node,
        startY: number,
        endY: number,
        onComplete?: AnimationCallback
    ): void {
        const pos = node.position.clone();
        node.setPosition(pos.x, startY, pos.z);
        
        tween(node)
            .to(0.15, { position: new Vec3(pos.x, endY + 5, pos.z) }, { easing: 'quadIn' })
            .to(0.08, { position: new Vec3(pos.x, endY - 3, pos.z) }, { easing: 'quadOut' })
            .to(0.05, { position: new Vec3(pos.x, endY, pos.z) })
            .call(() => {
                onComplete?.();
            })
            .start();
    }
}
