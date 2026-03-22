/**
 * 双色胶囊 - 关卡选择界面
 * 显示关卡列表、星级、锁定状态等
 */

import { _decorator, Component, Node, Prefab, instantiate, Button, Label, Sprite, Color } from 'cc';
import { LevelManager, LevelData } from '../core/LevelManager';
import { GameManager } from '../managers/GameManager';

const { ccclass, property } = _decorator;

@ccclass('LevelSelectUI')
export class LevelSelectUI extends Component {
    @property(Node)
    levelGrid: Node | null = null;
    
    @property(Prefab)
    levelItemPrefab: Prefab | null = null;
    
    @property(Button)
    backButton: Button | null = null;
    
    @property(Label)
    totalStarsLabel: Label | null = null;
    
    @property(Label)
    progressLabel: Label | null = null;
    
    private gameManager: GameManager | null = null;
    private levelManager: LevelManager;
    
    constructor() {
        super();
        this.levelManager = LevelManager.getInstance();
    }
    
    onLoad() {
        this.setupButtons();
    }
    
    private setupButtons(): void {
        this.backButton?.node.on(Button.EventType.CLICK, this.onBack, this);
    }
    
    // 设置游戏管理器引用
    public setGameManager(manager: GameManager): void {
        this.gameManager = manager;
    }
    
    // 显示关卡选择
    public show(): void {
        this.node.active = true;
        this.refreshLevels();
    }
    
    // 隐藏
    public hide(): void {
        this.node.active = false;
    }
    
    // 刷新关卡列表
    public refreshLevels(): void {
        if (!this.levelGrid) return;
        
        // 清空现有内容
        this.levelGrid.removeAllChildren();
        
        // 获取所有关卡
        const levels = this.levelManager.getAllLevels();
        
        // 创建关卡项
        for (const level of levels) {
            const item = this.createLevelItem(level);
            this.levelGrid.addChild(item);
        }
        
        // 更新统计
        this.updateStats();
    }
    
    // 创建关卡项
    private createLevelItem(level: LevelData): Node {
        let itemNode: Node;
        
        if (this.levelItemPrefab) {
            itemNode = instantiate(this.levelItemPrefab);
        } else {
            // 创建简单的节点
            itemNode = this.createSimpleLevelItem(level);
        }
        
        // 设置数据
        this.setupLevelItem(itemNode, level);
        
        return itemNode;
    }
    
    // 创建简单的关卡项节点
    private createSimpleLevelItem(level: LevelData): Node {
        const node = new Node(`Level_${level.id}`);
        
        // 添加 Label 显示关卡号
        const label = node.addComponent(Label);
        label.string = `${level.id}`;
        label.fontSize = 24;
        
        // 添加点击事件
        const button = node.addComponent(Button);
        button.node.on(Button.EventType.CLICK, () => this.onLevelClick(level.id), this);
        
        return node;
    }
    
    // 设置关卡项内容
    private setupLevelItem(node: Node, level: LevelData): void {
        // 查找子节点
        const levelLabel = node.getChildByName('LevelLabel')?.getComponent(Label);
        const starsContainer = node.getChildByName('Stars');
        const lockIcon = node.getChildByName('LockIcon');
        const button = node.getComponent(Button);
        
        // 设置关卡号
        if (levelLabel) {
            levelLabel.string = `${level.id}`;
        }
        
        // 设置星级
        if (starsContainer) {
            this.updateLevelStars(starsContainer, level.stars);
        }
        
        // 设置锁定状态
        if (lockIcon) {
            lockIcon.active = !level.unlocked;
        }
        
        // 设置按钮状态
        if (button) {
            button.interactable = level.unlocked;
            button.node.off(Button.EventType.CLICK);
            button.node.on(Button.EventType.CLICK, () => this.onLevelClick(level.id), this);
        }
        
        // 视觉反馈
        if (!level.unlocked) {
            const sprite = node.getComponent(Sprite);
            if (sprite) {
                sprite.color = new Color(128, 128, 128, 255);
            }
        }
    }
    
    // 更新关卡星级显示
    private updateLevelStars(container: Node, stars: number): void {
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            const star = children[i];
            const sprite = star.getComponent(Sprite);
            
            if (sprite) {
                // 根据是否获得星星设置不同颜色
                if (i < stars) {
                    sprite.color = new Color(255, 215, 0, 255); // 金色
                } else {
                    sprite.color = new Color(128, 128, 128, 255); // 灰色
                }
            }
        }
    }
    
    // 更新统计信息
    private updateStats(): void {
        const totalStars = this.levelManager.getTotalStars();
        const completedCount = this.levelManager.getCompletedCount();
        const totalLevels = 20;
        
        if (this.totalStarsLabel) {
            this.totalStarsLabel.string = `星星: ${totalStars} / ${totalLevels * 3}`;
        }
        
        if (this.progressLabel) {
            this.progressLabel.string = `进度: ${completedCount} / ${totalLevels}`;
        }
    }
    
    // 关卡点击
    private onLevelClick(levelId: number): void {
        const level = this.levelManager.getLevel(levelId);
        
        if (level && level.unlocked) {
            this.levelManager.setCurrentLevel(levelId);
            this.gameManager?.startGame(levelId);
            this.hide();
        }
    }
    
    // 返回按钮
    private onBack(): void {
        this.hide();
        this.gameManager?.showMenu();
    }
}
