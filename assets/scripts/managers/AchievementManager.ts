/**
 * 双色胶囊 - 成就系统
 * 负责成就的定义、解锁和通知
 */

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;        // 图标名称
    unlocked: boolean;
    unlockedAt?: number; // 解锁时间戳
    progress: number;    // 当前进度
    target: number;      // 目标值
}

export class AchievementManager {
    private static instance: AchievementManager;
    
    // 成就定义
    private achievements: Map<string, Achievement> = new Map();
    
    // 成就解锁回调
    private onUnlockCallback?: (achievement: Achievement) => void;
    
    private constructor() {
        this.initAchievements();
        this.loadProgress();
    }
    
    public static getInstance(): AchievementManager {
        if (!AchievementManager.instance) {
            AchievementManager.instance = new AchievementManager();
        }
        return AchievementManager.instance;
    }
    
    // 初始化成就
    private initAchievements(): void {
        const definitions: Omit<Achievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [
            // 关卡成就
            {
                id: 'first_clear',
                name: '初次胜利',
                description: '通过第一关',
                icon: 'trophy',
                target: 1
            },
            {
                id: 'level_5',
                name: '新手医生',
                description: '通过前5关',
                icon: 'medal',
                target: 5
            },
            {
                id: 'level_10',
                name: '熟练医生',
                description: '通过前10关',
                icon: 'medal',
                target: 10
            },
            {
                id: 'level_20',
                name: '医学专家',
                description: '通过全部20关',
                icon: 'crown',
                target: 20
            },
            
            // 连击成就
            {
                id: 'combo_3',
                name: '连击新手',
                description: '达成3连击',
                icon: 'fire',
                target: 3
            },
            {
                id: 'combo_5',
                name: '连击达人',
                description: '达成5连击',
                icon: 'fire',
                target: 5
            },
            {
                id: 'combo_10',
                name: '连击大师',
                description: '达成10连击',
                icon: 'fire',
                target: 10
            },
            
            // 分数成就
            {
                id: 'score_1000',
                name: '千分起步',
                description: '单局得分超过1000',
                icon: 'star',
                target: 1000
            },
            {
                id: 'score_5000',
                name: '高分玩家',
                description: '单局得分超过5000',
                icon: 'star',
                target: 5000
            },
            {
                id: 'score_10000',
                name: '分数大师',
                description: '单局得分超过10000',
                icon: 'star',
                target: 10000
            },
            
            // 消除成就
            {
                id: 'virus_100',
                name: '病毒克星',
                description: '累计消除100个病毒',
                icon: 'virus',
                target: 100
            },
            {
                id: 'virus_500',
                name: '病毒终结者',
                description: '累计消除500个病毒',
                icon: 'virus',
                target: 500
            },
            {
                id: 'virus_1000',
                name: '病毒猎人',
                description: '累计消除1000个病毒',
                icon: 'virus',
                target: 1000
            },
            
            // 游戏时长成就
            {
                id: 'games_10',
                name: '入门玩家',
                description: '游玩10局',
                icon: 'gamepad',
                target: 10
            },
            {
                id: 'games_50',
                name: '忠实玩家',
                description: '游玩50局',
                icon: 'gamepad',
                target: 50
            },
            {
                id: 'games_100',
                name: '资深玩家',
                description: '游玩100局',
                icon: 'gamepad',
                target: 100
            },
            
            // 无限模式成就
            {
                id: 'endless_5min',
                name: '持久战',
                description: '无限模式存活5分钟',
                icon: 'clock',
                target: 300
            },
            {
                id: 'endless_10min',
                name: '持久战专家',
                description: '无限模式存活10分钟',
                icon: 'clock',
                target: 600
            }
        ];
        
        for (const def of definitions) {
            this.achievements.set(def.id, {
                ...def,
                unlocked: false,
                progress: 0
            });
        }
    }
    
    // 加载进度
    private loadProgress(): void {
        try {
            const saved = localStorage.getItem('dualCapsule_achievements');
            if (saved) {
                const data = JSON.parse(saved);
                
                for (const [id, achievement] of Object.entries(data)) {
                    if (this.achievements.has(id)) {
                        const stored = achievement as Partial<Achievement>;
                        const current = this.achievements.get(id)!;
                        
                        current.unlocked = stored.unlocked ?? false;
                        current.progress = stored.progress ?? 0;
                        current.unlockedAt = stored.unlockedAt;
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load achievements:', e);
        }
    }
    
    // 保存进度
    private saveProgress(): void {
        try {
            const data: any = {};
            
            this.achievements.forEach((achievement, id) => {
                data[id] = {
                    unlocked: achievement.unlocked,
                    progress: achievement.progress,
                    unlockedAt: achievement.unlockedAt
                };
            });
            
            localStorage.setItem('dualCapsule_achievements', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save achievements:', e);
        }
    }
    
    // 设置解锁回调
    public setUnlockCallback(callback: (achievement: Achievement) => void): void {
        this.onUnlockCallback = callback;
    }
    
    // 更新进度
    public updateProgress(id: string, value: number): boolean {
        const achievement = this.achievements.get(id);
        if (!achievement || achievement.unlocked) return false;
        
        achievement.progress = Math.max(achievement.progress, value);
        
        if (achievement.progress >= achievement.target) {
            this.unlock(id);
            return true;
        }
        
        this.saveProgress();
        return false;
    }
    
    // 增加进度
    public addProgress(id: string, value: number): boolean {
        const achievement = this.achievements.get(id);
        if (!achievement || achievement.unlocked) return false;
        
        achievement.progress += value;
        
        if (achievement.progress >= achievement.target) {
            this.unlock(id);
            return true;
        }
        
        this.saveProgress();
        return false;
    }
    
    // 解锁成就
    private unlock(id: string): void {
        const achievement = this.achievements.get(id);
        if (!achievement || achievement.unlocked) return;
        
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        
        this.saveProgress();
        this.onUnlockCallback?.(achievement);
    }
    
    // 获取成就
    public getAchievement(id: string): Achievement | undefined {
        return this.achievements.get(id);
    }
    
    // 获取所有成就
    public getAllAchievements(): Achievement[] {
        return Array.from(this.achievements.values());
    }
    
    // 获取已解锁成就
    public getUnlockedAchievements(): Achievement[] {
        return this.getAllAchievements().filter(a => a.unlocked);
    }
    
    // 获取未解锁成就
    public getLockedAchievements(): Achievement[] {
        return this.getAllAchievements().filter(a => !a.unlocked);
    }
    
    // 获取解锁数量
    public getUnlockedCount(): number {
        return this.getUnlockedAchievements().length;
    }
    
    // 获取总数量
    public getTotalCount(): number {
        return this.achievements.size;
    }
    
    // 获取完成率
    public getCompletionRate(): number {
        return this.getUnlockedCount() / this.getTotalCount();
    }
    
    // 检查并更新关卡成就
    public checkLevelAchievements(completedLevels: number): void {
        this.updateProgress('first_clear', completedLevels);
        this.updateProgress('level_5', completedLevels);
        this.updateProgress('level_10', completedLevels);
        this.updateProgress('level_20', completedLevels);
    }
    
    // 检查并更新连击成就
    public checkComboAchievements(maxCombo: number): void {
        this.updateProgress('combo_3', maxCombo);
        this.updateProgress('combo_5', maxCombo);
        this.updateProgress('combo_10', maxCombo);
    }
    
    // 检查并更新分数成就
    public checkScoreAchievements(score: number): void {
        this.updateProgress('score_1000', score);
        this.updateProgress('score_5000', score);
        this.updateProgress('score_10000', score);
    }
    
    // 检查并更新病毒消除成就
    public checkVirusAchievements(totalViruses: number): void {
        this.updateProgress('virus_100', totalViruses);
        this.updateProgress('virus_500', totalViruses);
        this.updateProgress('virus_1000', totalViruses);
    }
    
    // 检查并更新游戏次数成就
    public checkGamesAchievements(totalGames: number): void {
        this.updateProgress('games_10', totalGames);
        this.updateProgress('games_50', totalGames);
        this.updateProgress('games_100', totalGames);
    }
    
    // 检查并更新无限模式时长成就
    public checkEndlessDurationAchievements(durationSeconds: number): void {
        this.updateProgress('endless_5min', durationSeconds);
        this.updateProgress('endless_10min', durationSeconds);
    }
    
    // 重置成就（调试用）
    public reset(): void {
        this.achievements.forEach(a => {
            a.unlocked = false;
            a.progress = 0;
            a.unlockedAt = undefined;
        });
        this.saveProgress();
    }
}
