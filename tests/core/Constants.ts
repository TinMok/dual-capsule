/**
 * 双色胶囊 - 游戏常量配置
 */

// 棋盘尺寸
export const BOARD_COLS = 8;
export const BOARD_ROWS = 16;

// 格子尺寸（像素）
export const CELL_SIZE = 48;

// 颜色定义
export enum CapsuleColor {
    RED = 'red',
    YELLOW = 'yellow',
    BLUE = 'blue',
    NONE = 'none'
}

// 旋转状态
export enum Rotation {
    UP = 0,      // 水平，左红右蓝
    RIGHT = 90,  // 垂直，上红下蓝
    DOWN = 180,  // 水平，左蓝右红
    LEFT = 270   // 垂直，上蓝下红
}

// 方向
export enum Direction {
    LEFT,
    RIGHT,
    DOWN
}

// 游戏状态
export enum GameState {
    IDLE,       // 空闲
    PLAYING,    // 游戏中
    PAUSED,     // 暂停
    VICTORY,    // 胜利
    GAME_OVER   // 失败
}

// 颜色映射（用于渲染）
export const COLOR_MAP: Record<CapsuleColor, string> = {
    [CapsuleColor.RED]: '#FF4444',
    [CapsuleColor.YELLOW]: '#FFCC00',
    [CapsuleColor.BLUE]: '#4488FF',
    [CapsuleColor.NONE]: '#FFFFFF'
};

// 下落速度配置（毫秒/格）
export const FALL_SPEEDS = {
    SLOW: 1000,
    NORMAL: 800,
    FAST: 600,
    VERY_FAST: 400
};

// 快速下落速度
export const FAST_FALL_SPEED = 50;

// 消除所需最小数量
export const MIN_MATCH_COUNT = 4;

// 关卡配置
export interface LevelConfig {
    level: number;
    virusCount: number;
    fallSpeed: number;
    speedMultiplier: number;
}

// 生成关卡配置
export function getLevelConfig(level: number): LevelConfig {
    const baseVirus = 4 + Math.floor(level * 1.5);
    const virusCount = Math.min(baseVirus, 24);
    
    const baseSpeed = FALL_SPEEDS.NORMAL - (level - 1) * 30;
    const fallSpeed = Math.max(baseSpeed, FALL_SPEEDS.VERY_FAST);
    
    const speedMultiplier = 1 + (level - 1) * 0.05;
    
    return {
        level,
        virusCount,
        fallSpeed,
        speedMultiplier
    };
}
