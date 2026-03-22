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
│   │   ├── ui/           # UI 脚本
│   │   ├── managers/     # 管理器
│   │   └── utils/        # 工具类
│   ├── prefabs/          # 预制体
│   ├── textures/         # 贴图资源
│   │   └── *.png.txt     # 图片生成提示词
│   ├── audio/            # 音频资源
│   └── animations/       # 动画资源
├── docs/                 # 文档
├── settings/             # 项目设置
└── README.md
```

## Phase 1 完成情况

- [x] 棋盘系统 (`Board.ts`)
- [x] 胶囊控制 - 移动、旋转、下落 (`Board.ts`)
- [x] 消除检测 (`MatchDetector.ts`)
- [x] 胜负判定
- [x] 游戏管理器 (`GameManager.ts`)
- [x] UI 界面框架 (`GameUI.ts`, `MenuUI.ts`, `CellRenderer.ts`)
- [x] 触摸控制 (`TouchControls.ts`)
- [x] 存档管理 (`SaveManager.ts`)
- [x] 音效管理框架 (`AudioManager.ts`)
- [x] 对象池优化 (`ObjectPool.ts`)

## 快速开始

### 1. 创建 Cocos Creator 项目

```bash
# 在 Cocos Dashboard 中创建新项目
# 选择 Cocos Creator 3.8.8
# 模板选择 Empty(2D)
```

### 2. 复制代码

将 `assets/scripts/` 目录复制到 Cocos Creator 项目的 `assets/` 目录下。

### 3. 生成图片资源

参考 `assets/textures/*.png.txt` 中的提示词，使用 AI 图像生成工具（如 Midjourney、DALL-E、Stable Diffusion）生成图片，保存为对应的 PNG 文件。

### 4. 创建场景

在 Cocos Creator 中：
1. 创建 `Game` 场景
2. 添加 `GameManager` 组件
3. 设置 UI 节点和引用

### 5. 运行测试

点击 Cocos Creator 的运行按钮，即可在浏览器中预览。

## 操作说明

| 操作 | 键盘 | 触摸 |
|------|------|------|
| 左移 | ← / A | 点击左侧 / 左滑 |
| 右移 | → / D | 点击右侧 / 右滑 |
| 旋转 | ↑ / W | 点击中央 / 双击 |
| 加速下落 | ↓ / S | 下滑 / 长按 |
| 硬降 | Space | 下落按钮 |
| 暂停 | ESC / P | 暂停按钮 |

## 图片资源说明

由于 AI 无法直接生成图片，以下文件包含生成提示词：

- `bg.png.txt` - 游戏背景
- 更多资源请参考文件内的提示词

使用 AI 图像工具生成后，将文件保存为对应的无 `.txt` 后缀的 PNG 文件。

## 文档

- [游戏策划案](./docs/GAME_DESIGN.md)

## 开发进度

- [x] Phase 1: 核心玩法原型
- [ ] Phase 2: 游戏流程完善
- [ ] Phase 3: 资源制作
- [ ] Phase 4: 微信适配
- [ ] Phase 5: 测试上线

## License

MIT
