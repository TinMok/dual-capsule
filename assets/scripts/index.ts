/**
 * 双色胶囊 - 模块导出
 */

// 核心模块
export * from './core/Constants';
export * from './core/Types';
export * from './core/Board';
export * from './core/MatchDetector';
export * from './core/LevelManager';
export * from './core/EndlessModeManager';

// 管理器
export * from './managers/GameManager';
export * from './managers/SaveManager';
export * from './managers/AudioManager';
export * from './managers/AnimationManager';
export * from './managers/AchievementManager';

// UI 组件
export * from './ui/GameUI';
export * from './ui/MenuUI';
export * from './ui/CellRenderer';
export * from './ui/TouchControls';
export * from './ui/GameOverUI';
export * from './ui/LevelSelectUI';

// 工具
export * from './utils/ObjectPool';
