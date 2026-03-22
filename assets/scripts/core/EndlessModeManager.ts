/**
 * 双色胶囊 - 无限模式管理器
 * 负责无限挑战模式的逻辑
 */

import { BOARD_COLS, BOARD_ROWS, CapsuleColor, FALL_SPEEDS, getLevelConfig } from './Constants';

export interface EndlessModeConfig {
    initialVirusCount: number;
    virusIncrement: number;      // 每 N 分增加的病毒数
    virusIncrementInterval: number; // 分数间隔
    maxVirusCount: number;
    initialFallSpeed: number;
    minFallSpeed: number;
    speedIncrement: number;       // 每 N 分速度提升
    speedIncrementInterval: number;
}

export interface EndlessModeState {
    score: number;
    virusesCleared: number;
    capsulesUsed: number;
    currentVirusCount: number;
    currentFallSpeed: number;
    gameDuration: number;    // 游戏时长（秒）
    combo: number;
    maxCombo: number;
}

export class EndlessModeManager {
    private static instance: EndlessModeManager;
    
    // 默认配置
    private config: EndlessModeConfig = {
        initialVirusCount: 4,
        virusIncrement: 2,
        virusIncrementInterval: 500,
        maxVirusCount: 28,
        initialFallSpeed: FALL_SPEEDS.NORMAL,
        minFallSpeed: 200,
        speedIncrement: 30,
        speedIncrementInterval: 300
    };
    
    // 当前状态
    private state: EndlessModeState;
    
    // 高分
    private highScore: number = 0;
    
    private constructor() {
        this.state = this.getInitialState();
        this.loadHighScore();
    }
    
    public static getInstance(): EndlessModeManager {
        if (!EndlessModeManager.instance) {
            EndlessModeManager.instance = new EndlessModeManager();
        }
        return EndlessModeManager.instance;
    }
    
    // 初始状态
    private getInitialState(): EndlessModeState {
        return {
            score: 0,
            virusesCleared: 0,
            capsulesUsed: 0,
            currentVirusCount: this.config.initialVirusCount,
            currentFallSpeed: this.config.initialFallSpeed,
            gameDuration: 0,
            combo: 0,
            maxCombo: 0
        };
    }
    
    // 加载高分
    private loadHighScore(): void {
        try {
            const saved = localStorage.getItem('dualCapsule_endless_highScore');
            this.highScore = saved ? parseInt(saved) : 0;
        } catch (e) {
            this.highScore = 0;
        }
    }
    
    // 保存高分
    private saveHighScore(): void {
        localStorage.setItem('dualCapsule_endless_highScore', this.highScore.toString());
    }
    
    // 开始新游戏
    public startGame(): EndlessModeState {
        this.state = this.getInitialState();
        return { ...this.state };
    }
    
    // 更新分数并调整难度
    public addScore(baseScore: number): void {
        const oldScore = this.state.score;
        this.state.score += baseScore;
        
        // 检查是否需要增加病毒
        const virusThresholds = Math.floor(this.state.score / this.config.virusIncrementInterval);
        const oldVirusThresholds = Math.floor(oldScore / this.config.virusIncrementInterval);
        
        if (virusThresholds > oldVirusThresholds) {
            this.state.currentVirusCount = Math.min(
                this.state.currentVirusCount + this.config.virusIncrement,
                this.config.maxVirusCount
            );
        }
        
        // 检查是否需要加速
        const speedThresholds = Math.floor(this.state.score / this.config.speedIncrementInterval);
        const oldSpeedThresholds = Math.floor(oldScore / this.config.speedIncrementInterval);
        
        if (speedThresholds > oldSpeedThresholds) {
            this.state.currentFallSpeed = Math.max(
                this.state.currentFallSpeed - this.config.speedIncrement,
                this.config.minFallSpeed
            );
        }
    }
    
    // 记录病毒消除
    public addVirusCleared(count: number): void {
        this.state.virusesCleared += count;
    }
    
    // 记录胶囊使用
    public addCapsuleUsed(): void {
        this.state.capsulesUsed++;
    }
    
    // 更新连击
    public setCombo(combo: number): void {
        this.state.combo = combo;
        if (combo > this.state.maxCombo) {
            this.state.maxCombo = combo;
        }
    }
    
    // 更新游戏时长
    public updateDuration(deltaTime: number): void {
        this.state.gameDuration += deltaTime;
    }
    
    // 游戏结束
    public endGame(): { score: number; isNewHighScore: boolean } {
        const isNewHighScore = this.state.score > this.highScore;
        
        if (isNewHighScore) {
            this.highScore = this.state.score;
            this.saveHighScore();
        }
        
        return {
            score: this.state.score,
            isNewHighScore
        };
    }
    
    // 获取当前状态
    public getState(): EndlessModeState {
        return { ...this.state };
    }
    
    // 获取当前病毒数
    public getCurrentVirusCount(): number {
        return this.state.currentVirusCount;
    }
    
    // 获取当前下落速度
    public getCurrentFallSpeed(): number {
        return this.state.currentFallSpeed;
    }
    
    // 获取高分
    public getHighScore(): number {
        return this.highScore;
    }
    
    // 设置配置
    public setConfig(config: Partial<EndlessModeConfig>): void {
        this.config = { ...this.config, ...config };
    }
    
    // 获取配置
    public getConfig(): EndlessModeConfig {
        return { ...this.config };
    }
    
    // 获取难度等级（用于显示）
    public getDifficultyLevel(): number {
        return Math.floor(this.state.score / 500) + 1;
    }
    
    // 获取难度名称
    public getDifficultyName(): string {
        const level = this.getDifficultyLevel();
        if (level <= 3) return '初级';
        if (level <= 6) return '中级';
        if (level <= 10) return '高级';
        return '专家';
    }
    
    // 格式化时长
    public formatDuration(): string {
        const totalSeconds = Math.floor(this.state.gameDuration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}
