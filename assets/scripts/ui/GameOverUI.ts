/**
 * 双色胶囊 - 游戏结束界面
 * 显示游戏结果、分数、评价等
 */

import { _decorator, Component, Node, Label, Button } from 'cc';
import { GameData } from '../core/Types';
import { GameManager } from '../managers/GameManager';
import { SaveManager } from '../managers/SaveManager';
import { LevelManager } from '../core/LevelManager';
import { AchievementManager } from '../managers/AchievementManager';

const { ccclass, property } = _decorator;

@ccclass('GameOverUI')
export class GameOverUI extends Component {
    @property(Label)
    scoreLabel: Label | null = null;
    
    @property(Label)
    highScoreLabel: Label | null = null;
    
    @property(Label)
    comboLabel: Label | null = null;
    
    @property(Label)
    virusesLabel: Label | null = null;
    
    @property(Node)
    starsContainer: Node | null = null;
    
    @property(Node)
    newHighScoreBadge: Node | null = null;
    
    @property(Button)
    retryButton: Button | null = null;
    
    @property(Button)
    menuButton: Button | null = null;
    
    @property(Button)
    nextButton: Button | null = null;
    
    private gameManager: GameManager | null = null;
    private gameData: GameData | null = null;
    private isVictory: boolean = false;
    
    onLoad() {
        this.setupButtons();
    }
    
    private setupButtons(): void {
        this.retryButton?.node.on(Button.EventType.CLICK, this.onRetry, this);
        this.menuButton?.node.on(Button.EventType.CLICK, this.onMenu, this);
        this.nextButton?.node.on(Button.EventType.CLICK, this.onNext, this);
    }
    
    // 显示游戏结束界面
    public show(data: GameData, isVictory: boolean, gameManager: GameManager): void {
        this.gameData = data;
        this.isVictory = isVictory;
        this.gameManager = gameManager;
        
        this.node.active = true;
        
        // 更新分数显示
        if (this.scoreLabel) {
            this.scoreLabel.string = `${data.score}`;
        }
        
        // 更新连击
        if (this.comboLabel) {
            this.comboLabel.string = `最大连击: ${data.maxCombo}`;
        }
        
        // 更新病毒数
        if (this.virusesLabel) {
            this.virusesLabel.string = `消除病毒: ${data.virusesCleared}`;
        }
        
        // 检查高分
        const saveManager = SaveManager.getInstance();
        const isNewHighScore = saveManager.updateHighScore(data.score);
        
        if (this.highScoreLabel) {
            this.highScoreLabel.string = `最高分: ${saveManager.getHighScore()}`;
        }
        
        if (this.newHighScoreBadge) {
            this.newHighScoreBadge.active = isNewHighScore;
        }
        
        // 计算并显示星级（仅胜利时）
        if (isVictory) {
            const levelManager = LevelManager.getInstance();
            const stars = levelManager.completeLevel(data.level, data.score);
            this.updateStars(stars);
            
            // 显示下一关按钮
            if (this.nextButton) {
                this.nextButton.node.active = data.level < 20;
            }
        } else {
            this.updateStars(0);
            if (this.nextButton) {
                this.nextButton.node.active = false;
            }
        }
        
        // 更新成就
        this.updateAchievements(data);
    }
    
    // 更新星级显示
    private updateStars(stars: number): void {
        if (!this.starsContainer) return;
        
        const children = this.starsContainer.children;
        for (let i = 0; i < children.length; i++) {
            // 这里需要根据实际 UI 实现来更新星星显示
            // 简单方案：激活/禁用节点
            children[i].active = i < stars;
        }
    }
    
    // 更新成就
    private updateAchievements(data: GameData): void {
        const achievementManager = AchievementManager.getInstance();
        const saveManager = SaveManager.getInstance();
        
        // 检查各类成就
        achievementManager.checkScoreAchievements(data.score);
        achievementManager.checkComboAchievements(data.maxCombo);
        achievementManager.checkVirusAchievements(saveManager.getTotalVirusesCleared() + data.virusesCleared);
        achievementManager.checkGamesAchievements(saveManager.getTotalGames() + 1);
        
        if (this.isVictory) {
            const levelManager = LevelManager.getInstance();
            achievementManager.checkLevelAchievements(levelManager.getCompletedCount());
        }
    }
    
    // 重试按钮
    private onRetry(): void {
        this.node.active = false;
        this.gameManager?.restart();
    }
    
    // 返回菜单
    private onMenu(): void {
        this.node.active = false;
        this.gameManager?.showMenu();
    }
    
    // 下一关
    private onNext(): void {
        this.node.active = false;
        this.gameManager?.nextLevel();
    }
    
    // 隐藏
    public hide(): void {
        this.node.active = false;
    }
}
