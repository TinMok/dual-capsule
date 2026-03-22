/**
 * 双色胶囊 - 游戏管理器
 * 负责游戏生命周期、关卡管理、输入处理
 */

import { _decorator, Component, Node, input, Input, KeyCode, EventKeyboard, Vec3 } from 'cc';
import { Board } from '../core/Board';
import { GameState, Direction, FALL_SPEEDS, FAST_FALL_SPEED, getLevelConfig } from '../core/Constants';
import { GameUI } from '../ui/GameUI';
import { MenuUI } from '../ui/MenuUI';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node)
    boardNode: Node | null = null;
    
    @property(GameUI)
    gameUI: GameUI | null = null;
    
    @property(MenuUI)
    menuUI: MenuUI | null = null;
    
    // 游戏核心
    private board: Board | null = null;
    
    // 当前进度
    private currentLevel: number = 1;
    
    // 下落计时
    private fallTimer: number = 0;
    private fallSpeed: number = FALL_SPEEDS.NORMAL;
    private isFastFalling: boolean = false;
    
    // 游戏循环
    private isRunning: boolean = false;
    
    onLoad() {
        this.board = new Board();
        this.setupInput();
        this.showMenu();
    }
    
    start() {
        // 初始化完成
    }
    
    update(deltaTime: number) {
        if (!this.isRunning) return;
        
        const state = this.board?.getGameState();
        if (state !== GameState.PLAYING) return;
        
        // 处理下落
        this.fallTimer += deltaTime * 1000;
        const currentSpeed = this.isFastFalling ? FAST_FALL_SPEED : this.fallSpeed;
        
        if (this.fallTimer >= currentSpeed) {
            this.fallTimer = 0;
            this.board?.tick();
        }
    }
    
    // 设置输入
    private setupInput(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
    
    // 键盘按下
    private onKeyDown(event: EventKeyboard): void {
        if (!this.board || this.board.getGameState() !== GameState.PLAYING) return;
        
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                this.board.moveCapsule(Direction.LEFT);
                break;
                
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this.board.moveCapsule(Direction.RIGHT);
                break;
                
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W:
                this.board.rotateCapsule(true);
                break;
                
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S:
                this.isFastFalling = true;
                break;
                
            case KeyCode.SPACE:
                this.board.hardDrop();
                break;
                
            case KeyCode.ESCAPE:
            case KeyCode.KEY_P:
                this.togglePause();
                break;
        }
    }
    
    // 键盘释放
    private onKeyUp(event: EventKeyboard): void {
        switch (event.keyCode) {
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S:
                this.isFastFalling = false;
                break;
        }
    }
    
    // 显示菜单
    public showMenu(): void {
        this.isRunning = false;
        this.menuUI?.show();
        this.gameUI?.hide();
    }
    
    // 开始游戏
    public startGame(level: number = 1): void {
        this.currentLevel = level;
        
        const config = getLevelConfig(level);
        this.fallSpeed = config.fallSpeed;
        
        // 设置回调
        this.board?.setCallbacks({
            onCellUpdate: this.onCellUpdate.bind(this),
            onScoreUpdate: this.onScoreUpdate.bind(this),
            onComboUpdate: this.onComboUpdate.bind(this),
            onGameStateChange: this.onGameStateChange.bind(this),
            onCapsuleUpdate: this.onCapsuleUpdate.bind(this),
            onNextCapsuleUpdate: this.onNextCapsuleUpdate.bind(this)
        });
        
        // 开始游戏
        this.board?.startGame(level);
        
        // 显示游戏界面
        this.menuUI?.hide();
        this.gameUI?.show();
        this.gameUI?.setLevel(level);
        
        this.isRunning = true;
        this.fallTimer = 0;
    }
    
    // 下一关
    public nextLevel(): void {
        this.startGame(this.currentLevel + 1);
    }
    
    // 重新开始
    public restart(): void {
        this.startGame(this.currentLevel);
    }
    
    // 暂停/继续
    public togglePause(): void {
        const state = this.board?.getGameState();
        if (state === GameState.PLAYING) {
            this.board?.pause();
        } else if (state === GameState.PAUSED) {
            this.board?.resume();
        }
    }
    
    // === 回调函数 ===
    
    private onCellUpdate(row: number, col: number, cell: any): void {
        this.gameUI?.updateCell(row, col, cell);
    }
    
    private onScoreUpdate(score: number): void {
        this.gameUI?.updateScore(score);
    }
    
    private onComboUpdate(combo: number): void {
        this.gameUI?.updateCombo(combo);
    }
    
    private onGameStateChange(state: GameState): void {
        switch (state) {
            case GameState.VICTORY:
                this.onVictory();
                break;
            case GameState.GAME_OVER:
                this.onGameOver();
                break;
            case GameState.PAUSED:
                this.gameUI?.showPauseOverlay(true);
                break;
            case GameState.PLAYING:
                this.gameUI?.showPauseOverlay(false);
                break;
        }
    }
    
    private onCapsuleUpdate(capsule: any): void {
        // 当前胶囊更新
    }
    
    private onNextCapsuleUpdate(capsule: any): void {
        this.gameUI?.updateNextCapsule(capsule);
    }
    
    // 胜利处理
    private onVictory(): void {
        this.isRunning = false;
        this.gameUI?.showVictory(this.board?.getGameData()!);
    }
    
    // 失败处理
    private onGameOver(): void {
        this.isRunning = false;
        this.gameUI?.showGameOver(this.board?.getGameData()!);
    }
    
    // 触摸控制（移动端）
    public onTouchLeft(): void {
        this.board?.moveCapsule(Direction.LEFT);
    }
    
    public onTouchRight(): void {
        this.board?.moveCapsule(Direction.RIGHT);
    }
    
    public onTouchRotate(): void {
        this.board?.rotateCapsule(true);
    }
    
    public onTouchDown(): void {
        this.isFastFalling = true;
    }
    
    public onTouchUp(): void {
        this.isFastFalling = false;
    }
    
    public onTouchDrop(): void {
        this.board?.hardDrop();
    }
    
    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
}
