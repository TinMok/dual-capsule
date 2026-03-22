/**
 * 双色胶囊 - 类型定义
 */

import { CapsuleColor } from './Constants';

// 格子内容
export interface Cell {
    row: number;
    col: number;
    type: 'empty' | 'virus' | 'capsule_left' | 'capsule_right';
    color: CapsuleColor;
    linkedCell?: { row: number; col: number }; // 胶囊两半的关联
}

// 消除匹配
export interface Match {
    cells: { row: number; col: number }[];
    color: CapsuleColor;
    count: number;
}

// 胶囊位置
export interface CapsulePosition {
    leftRow: number;
    leftCol: number;
    rightRow: number;
    rightCol: number;
}

// 下落胶囊数据
export interface FallingCapsule {
    leftColor: CapsuleColor;
    rightColor: CapsuleColor;
    row: number;      // 左半边行
    col: number;      // 左半边列
    rotation: number; // 0, 90, 180, 270
}

// 病毒数据
export interface VirusData {
    row: number;
    col: number;
    color: CapsuleColor;
}

// 游戏数据
export interface GameData {
    score: number;
    level: number;
    combo: number;
    maxCombo: number;
    virusesCleared: number;
    capsulesUsed: number;
}

// 存档数据
export interface SaveData {
    highScore: number;
    unlockedLevel: number;
    totalGames: number;
    totalVirusesCleared: number;
}
