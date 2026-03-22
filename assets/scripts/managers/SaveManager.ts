/**
 * 双色胶囊 - 存档管理器
 * 负责游戏进度的保存和读取
 */

import { SaveData } from '../core/Types';

const STORAGE_KEY = 'dual_capsule_save';

export class SaveManager {
    private static instance: SaveManager;
    private data: SaveData;
    
    private constructor() {
        this.data = this.load();
    }
    
    // 获取单例
    public static getInstance(): SaveManager {
        if (!SaveManager.instance) {
            SaveManager.instance = new SaveManager();
        }
        return SaveManager.instance;
    }
    
    // 加载存档
    private load(): SaveData {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load save data:', e);
        }
        
        // 返回默认数据
        return {
            highScore: 0,
            unlockedLevel: 1,
            totalGames: 0,
            totalVirusesCleared: 0
        };
    }
    
    // 保存
    public save(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('Failed to save data:', e);
        }
    }
    
    // 获取最高分
    public getHighScore(): number {
        return this.data.highScore;
    }
    
    // 更新最高分
    public updateHighScore(score: number): boolean {
        if (score > this.data.highScore) {
            this.data.highScore = score;
            this.save();
            return true;
        }
        return false;
    }
    
    // 获取已解锁关卡
    public getUnlockedLevel(): number {
        return this.data.unlockedLevel;
    }
    
    // 解锁关卡
    public unlockLevel(level: number): void {
        if (level > this.data.unlockedLevel) {
            this.data.unlockedLevel = level;
            this.save();
        }
    }
    
    // 增加游戏次数
    public incrementGames(): void {
        this.data.totalGames++;
        this.save();
    }
    
    // 增加消除病毒数
    public addVirusesCleared(count: number): void {
        this.data.totalVirusesCleared += count;
        this.save();
    }
    
    // 获取总消除病毒数
    public getTotalVirusesCleared(): number {
        return this.data.totalVirusesCleared;
    }
    
    // 获取总游戏次数
    public getTotalGames(): number {
        return this.data.totalGames;
    }
    
    // 重置存档
    public reset(): void {
        this.data = {
            highScore: 0,
            unlockedLevel: 1,
            totalGames: 0,
            totalVirusesCleared: 0
        };
        this.save();
    }
    
    // 获取所有数据
    public getAllData(): SaveData {
        return { ...this.data };
    }
}
