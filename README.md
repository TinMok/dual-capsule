# 双色胶囊 / Dual Capsule

> FC《马里奥医生》复刻版 | Cocos Creator 3.8.8 | 微信小游戏

## 游戏简介

《双色胶囊》是经典 FC 游戏《马里奥医生》的精神续作。玩家扮演药剂师，通过旋转和投放双色胶囊，使 4 个或以上同色方块连成一线进行消除，目标是清空瓶内所有病毒。

## 核心玩法

- 🎮 控制双色胶囊的移动和旋转
- 🧬 使 4 个以上同色方块连成一线消除
- ⚡ 连锁消除获得高分
- 🏆 清空所有病毒即可过关

## 技术栈

- **引擎**: Cocos Creator 3.8.8
- **语言**: TypeScript
- **平台**: 微信小游戏

## 项目结构

```
dual-capsule/
├── assets/
│   ├── scenes/           # 场景文件
│   ├── scripts/          # TypeScript 脚本
│   │   ├── core/         # 核心逻辑
│   │   │   ├── Board.ts          # 棋盘管理
│   │   │   ├── MatchDetector.ts  # 消除检测
│   │   │   ├── LevelManager.ts   # 关卡管理
│   │   │   └── EndlessModeManager.ts  # 无限模式
│   │   ├── ui/           # UI 组件
│   │   │   ├── GameUI.ts         # 游戏界面
│   │   │   ├── MenuUI.ts         # 主菜单
│   │   │   ├── LevelSelectUI.ts  # 关卡选择
│   │   │   ├── GameOverUI.ts     # 结算界面
│   │   │   └── CellRenderer.ts   # 格子渲染
│   │   ├── managers/     # 管理器
│   │   │   ├── GameManager.ts    # 游戏管理
│   │   │   ├── SaveManager.ts    # 存档管理
│   │   │   ├── AudioManager.ts   # 音效管理
│   │   │   ├── AnimationManager.ts # 动画管理
│   │   │   └── AchievementManager.ts # 成就系统
│   │   └── utils/        # 工具类
│   ├── prefabs/          # 预制体
│   ├── textures/         # 贴图资源
│   ├── audio/            # 音频资源
│   └── animations/       # 动画资源
├── docs/                 # 文档
├── tests/                # 单元测试
├── settings/             # 项目设置
└── README.md
```

## 开发进度

### ✅ Phase 1: 核心玩法原型
- [x] 棋盘系统 (Board.ts)
- [x] 胶囊控制 - 移动、旋转、下落
- [x] 消除检测 (MatchDetector.ts)
- [x] 胜负判定
- [x] 单元测试框架

### ✅ Phase 2: 游戏流程完善
- [x] 关卡系统 (LevelManager.ts) - 20关卡，星级评价
- [x] UI 界面 (GameUI, MenuUI, LevelSelectUI, GameOverUI)
- [x] 分数系统 (连击倍率、病毒加分)
- [x] 动画管理 (AnimationManager.ts)
- [x] 成就系统 (AchievementManager.ts)
- [x] 无限模式 (EndlessModeManager.ts)

### 📋 Phase 3: 资源制作
- [x] 图片资源 (bg, logo, icon 等)
- [ ] 音效音乐
- [ ] 特效动画
- [ ] 粒子效果

### 📋 Phase 4: 微信适配
- [ ] 小游戏发布
- [ ] 社交功能
- [ ] 性能优化

### 📋 Phase 5: 测试上线
- [ ] 内测调优
- [ ] 提交审核
- [ ] 正式发布

## 游戏模式

### 经典关卡模式
- 20 个精心设计的关卡
- 难度逐步递增
- 星级评价系统 (0-3星)
- 解锁机制

### 无限挑战模式
- 病毒数量随分数递增
- 下落速度逐渐加快
- 追求最高分和最长存活时间
- 排行榜竞争

## 操作说明

| 操作 | 键盘 | 触摸 |
|------|------|------|
| 左移 | ← / A | 点击左侧 / 左滑 |
| 右移 | → / D | 点击右侧 / 右滑 |
| 旋转 | ↑ / W | 点击中央 / 双击 |
| 加速下落 | ↓ / S | 下滑 / 长按 |
| 硬降 | Space | 下落按钮 |
| 暂停 | ESC / P | 暂停按钮 |

## 图片资源

| 文件 | 尺寸 | 用途 |
|------|------|------|
| bg.png | 720 x 1280 | 游戏主背景 |
| bg_menu.png | 720 x 1280 | 主菜单背景 |
| bg_victory.png | 720 x 1280 | 胜利界面背景 |
| bg_gameover.png | 720 x 1280 | 失败界面背景 |
| logo.png | 720 x 1280 | 游戏LOGO |
| icon.png | 512 x 512 | 应用图标 |

## 运行测试

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 测试覆盖率
npm run test:coverage
```

## 文档

- [游戏策划案](./docs/GAME_DESIGN.md)

## License

MIT
