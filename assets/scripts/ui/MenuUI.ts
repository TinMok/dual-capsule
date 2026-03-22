/**
 * 双色胶囊 - 菜单界面
 * 主菜单、关卡选择、设置等
 */

import { _decorator, Component, Node, Label, Button } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MenuUI')
export class MenuUI extends Component {
    @property(Node)
    mainMenu: Node | null = null;
    
    @property(Node)
    levelSelect: Node | null = null;
    
    @property(Node)
    settingsPanel: Node | null = null;
    
    @property(Label)
    highScoreLabel: Label | null = null;
    
    private onPlayCallback?: (level: number) => void;
    private highScore: number = 0;
    
    onLoad() {
        this.loadHighScore();
        this.showMainMenu();
    }
    
    // 加载最高分
    private loadHighScore(): void {
        // 从本地存储加载
        const saved = localStorage.getItem('dualCapsule_highScore');
        this.highScore = saved ? parseInt(saved) : 0;
        
        if (this.highScoreLabel) {
            this.highScoreLabel.string = `最高分: ${this.highScore}`;
        }
    }
    
    // 保存最高分
    public saveHighScore(score: number): void {
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem('dualCapsule_highScore', score.toString());
            
            if (this.highScoreLabel) {
                this.highScoreLabel.string = `最高分: ${this.highScore}`;
            }
        }
    }
    
    // 设置回调
    public setPlayCallback(callback: (level: number) => void): void {
        this.onPlayCallback = callback;
    }
    
    // 显示主菜单
    public showMainMenu(): void {
        this.mainMenu && (this.mainMenu.active = true);
        this.levelSelect && (this.levelSelect.active = false);
        this.settingsPanel && (this.settingsPanel.active = false);
    }
    
    // 显示关卡选择
    public showLevelSelect(): void {
        this.mainMenu && (this.mainMenu.active = false);
        this.levelSelect && (this.levelSelect.active = true);
    }
    
    // 显示设置
    public showSettings(): void {
        this.mainMenu && (this.mainMenu.active = false);
        this.settingsPanel && (this.settingsPanel.active = true);
    }
    
    // 开始游戏（按钮回调）
    public onPlayClick(): void {
        this.showLevelSelect();
    }
    
    // 选择关卡（按钮回调）
    public onLevelSelect(level: number): void {
        if (this.onPlayCallback) {
            this.onPlayCallback(level);
        }
    }
    
    // 快速开始（从关卡1开始）
    public onQuickStart(): void {
        if (this.onPlayCallback) {
            this.onPlayCallback(1);
        }
    }
    
    // 设置按钮
    public onSettingsClick(): void {
        this.showSettings();
    }
    
    // 返回主菜单
    public onBackClick(): void {
        this.showMainMenu();
    }
    
    // 显示
    public show(): void {
        this.node.active = true;
        this.showMainMenu();
    }
    
    // 隐藏
    public hide(): void {
        this.node.active = false;
    }
    
    // 获取最高分
    public getHighScore(): number {
        return this.highScore;
    }
}
