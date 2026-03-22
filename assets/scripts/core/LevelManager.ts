/**
 * 双色胶囊 - 关卡管理器
 * 负责关卡配置、进度、解锁逻辑
 */

import { getLevelConfig, LevelConfig, FALL_SPEEDS } from './Constants';

export interface LevelData {
    id: number;
    name: string;
    virusCount: number;
    fallSpeed: number;
    unlocked: boolean;
    completed: boolean;
    highScore: number;
    stars: number;  // 0-3 星评价
}

export class LevelManager {
    private static instance: LevelManager;
    
    // 所有关卡数据
    private levels: Map<number, LevelData> = new Map();
    
    // 最大关卡数
    private readonly MAX_LEVEL = 20;
    
    // 当前关卡
    private currentLevel: number = 1;
    
    private constructor() {
        this.initLevels();
        this.loadProgress();
    }
    
    // 获取单例
    public static getInstance(): LevelManager {
        if (!LevelManager.instance) {
            LevelManager.instance = new LevelManager();
        }
        return LevelManager.instance;
    }
    
    // 初始化关卡
    private initLevels(): void {
        for (let i = 1; i <= this.MAX_LEVEL; i++) {
            const config = getLevelConfig(i);
            
            this.levels.set(i, {
                id: i,
                name: this.getLevelName(i),
                virusCount: config.virusCount,
                fallSpeed: config.fallSpeed,
                unlocked: i === 1,  // 第一关默认解锁
                completed: false,
                highScore: 0,
                stars: 0
            });
        }
    }
    
    // 获取关卡名称
    private getLevelName(level: number): string {
        if (level <= 5) return `初级 ${level}`;
        if (level <= 10) return `中级 ${level - 5}`;
        if (level <= 15) return `高级 ${level - 10}`;
        return `专家 ${level - 15}`;
    }
    
    // 加载进度
    private loadProgress(): void {
        try {
            const saved = localStorage.getItem('dualCapsule_progress');
            if (saved) {
                const data = JSON.parse(saved);
                
                for (const [id, levelData] of Object.entries(data.levels || {})) {
                    const level = parseInt(id);
                    const stored = levelData as Partial<LevelData>;
                    
                    if (this.levels.has(level)) {
                        const current = this.levels.get(level)!;
                        this.levels.set(level, {
                            ...current,
                            unlocked: stored.unlocked ?? current.unlocked,
                            completed: stored.completed ?? false,
                            highScore: stored.highScore ?? 0,
                            stars: stored.stars ?? 0
                        });
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load progress:', e);
        }
    }
    
    // 保存进度
    private saveProgress(): void {
        try {
            const data: any = { levels: {} };
            
            this.levels.forEach((level, id) => {
                data.levels[id] = {
                    unlocked: level.unlocked,
                    completed: level.completed,
                    highScore: level.highScore,
                    stars: level.stars
                };
            });
            
            localStorage.setItem('dualCapsule_progress', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }
    
    // 获取关卡数据
    public getLevel(id: number): LevelData | undefined {
        return this.levels.get(id);
    }
    
    // 获取所有关卡
    public getAllLevels(): LevelData[] {
        return Array.from(this.levels.values());
    }
    
    // 获取已解锁关卡
    public getUnlockedLevels(): LevelData[] {
        return this.getAllLevels().filter(l => l.unlocked);
    }
    
    // 设置当前关卡
    public setCurrentLevel(level: number): void {
        if (this.levels.has(level) && this.levels.get(level)!.unlocked) {
            this.currentLevel = level;
        }
    }
    
    // 获取当前关卡
    public getCurrentLevel(): number {
        return this.currentLevel;
    }
    
    // 完成关卡
    public completeLevel(level: number, score: number): number {
        const levelData = this.levels.get(level);
        if (!levelData) return 0;
        
        // 计算星级
        const stars = this.calculateStars(level, score);
        
        // 更新数据
        levelData.completed = true;
        levelData.highScore = Math.max(levelData.highScore, score);
        levelData.stars = Math.max(levelData.stars, stars);
        
        // 解锁下一关
        if (level < this.MAX_LEVEL) {
            const nextLevel = this.levels.get(level + 1);
            if (nextLevel) {
                nextLevel.unlocked = true;
            }
        }
        
        this.saveProgress();
        
        return stars;
    }
    
    // 计算星级
    private calculateStars(level: number, score: number): number {
        const config = getLevelConfig(level);
        const baseScore = config.virusCount * 50;  // 基础分
        
        if (score >= baseScore * 3) return 3;
        if (score >= baseScore * 2) return 2;
        if (score >= baseScore) return 1;
        return 0;
    }
    
    // 检查关卡是否解锁
    public isLevelUnlocked(level: number): boolean {
        return this.levels.get(level)?.unlocked ?? false;
    }
    
    // 获取关卡配置
    public getLevelConfig(level: number): LevelConfig {
        return getLevelConfig(level);
    }
    
    // 重置进度
    public resetProgress(): void {
        this.initLevels();
        this.saveProgress();
    }
    
    // 获取总星数
    public getTotalStars(): number {
        let total = 0;
        this.levels.forEach(l => total += l.stars);
        return total;
    }
    
    // 获取完成关卡数
    public getCompletedCount(): number {
        let count = 0;
        this.levels.forEach(l => {
            if (l.completed) count++;
        });
        return count;
    }
    
    // 获取最高分关卡
    public getHighScoreLevel(): { level: number; score: number } {
        let maxScore = 0;
        let maxLevel = 1;
        
        this.levels.forEach((l, id) => {
            if (l.highScore > maxScore) {
                maxScore = l.highScore;
                maxLevel = id;
            }
        });
        
        return { level: maxLevel, score: maxScore };
    }
}
