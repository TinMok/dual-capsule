/**
 * 双色胶囊 - 游戏界面
 * 负责渲染棋盘、分数、胶囊预览等
 */

import { _decorator, Component, Node, Prefab, instantiate, Sprite, Color, Label, UITransform, Vec3 } from 'cc';
import { BOARD_COLS, BOARD_ROWS, CELL_SIZE, CapsuleColor, COLOR_MAP, GameState } from '../core/Constants';
import { GameData, FallingCapsule, Cell } from '../core/Types';
import { CellRenderer } from './CellRenderer';

const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component {
    // 棋盘容器
    @property(Node)
    boardContainer: Node | null = null;
    
    // 下一个胶囊预览
    @property(Node)
    nextCapsuleContainer: Node | null = null;
    
    // UI 元素
    @property(Label)
    scoreLabel: Label | null = null;
    
    @property(Label)
    levelLabel: Label | null = null;
    
    @property(Label)
    comboLabel: Label | null = null;
    
    @property(Label)
    virusLabel: Label | null = null;
    
    // 弹窗
    @property(Node)
    pauseOverlay: Node | null = null;
    
    @property(Node)
    victoryOverlay: Node | null = null;
    
    @property(Node)
    gameOverOverlay: Node | null = null;
    
    // 格子预制体
    @property(Prefab)
    cellPrefab: Prefab | null = null;
    
    // 格子渲染器缓存
    private cellRenderers: CellRenderer[][] = [];
    
    // 下一个胶囊渲染器
    private nextCapsuleRenderers: CellRenderer[] = [];
    
    onLoad() {
        this.initBoard();
        this.initNextCapsulePreview();
    }
    
    // 初始化棋盘
    private initBoard(): void {
        if (!this.boardContainer) return;
        
        // 清空现有内容
        this.boardContainer.removeAllChildren();
        this.cellRenderers = [];
        
        // 计算棋盘偏移（居中）
        const boardWidth = BOARD_COLS * CELL_SIZE;
        const boardHeight = BOARD_ROWS * CELL_SIZE;
        
        for (let row = 0; row < BOARD_ROWS; row++) {
            this.cellRenderers[row] = [];
            
            for (let col = 0; col < BOARD_COLS; col++) {
                const cellNode = this.createCellNode();
                cellNode.setParent(this.boardContainer);
                
                // 设置位置
                const x = (col - BOARD_COLS / 2 + 0.5) * CELL_SIZE;
                const y = (BOARD_ROWS / 2 - row - 0.5) * CELL_SIZE;
                cellNode.setPosition(new Vec3(x, y, 0));
                
                // 获取渲染器组件
                const renderer = cellNode.getComponent(CellRenderer);
                if (renderer) {
                    this.cellRenderers[row][col] = renderer;
                    renderer.setEmpty();
                }
            }
        }
    }
    
    // 创建格子节点
    private createCellNode(): Node {
        if (this.cellPrefab) {
            return instantiate(this.cellPrefab);
        }
        
        // 如果没有预制体，创建一个简单的节点
        const node = new Node('Cell');
        node.addComponent(UITransform);
        node.getComponent(UITransform)!.setContentSize(CELL_SIZE - 2, CELL_SIZE - 2);
        
        const sprite = node.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        
        // 添加渲染器组件
        node.addComponent(CellRenderer);
        
        return node;
    }
    
    // 初始化下一个胶囊预览
    private initNextCapsulePreview(): void {
        if (!this.nextCapsuleContainer) return;
        
        this.nextCapsuleContainer.removeAllChildren();
        this.nextCapsuleRenderers = [];
        
        for (let i = 0; i < 2; i++) {
            const cellNode = this.createCellNode();
            cellNode.setParent(this.nextCapsuleContainer);
            
            const x = (i - 0.5) * CELL_SIZE;
            cellNode.setPosition(new Vec3(x, 0, 0));
            
            const renderer = cellNode.getComponent(CellRenderer);
            if (renderer) {
                this.nextCapsuleRenderers.push(renderer);
                renderer.setEmpty();
            }
        }
    }
    
    // 更新单个格子
    public updateCell(row: number, col: number, cell: Cell): void {
        if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) return;
        
        const renderer = this.cellRenderers[row]?.[col];
        if (!renderer) return;
        
        switch (cell.type) {
            case 'empty':
                renderer.setEmpty();
                break;
            case 'virus':
                renderer.setVirus(cell.color);
                break;
            case 'capsule_left':
                renderer.setCapsuleLeft(cell.color);
                break;
            case 'capsule_right':
                renderer.setCapsuleRight(cell.color);
                break;
        }
    }
    
    // 更新分数
    public updateScore(score: number): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = `分数: ${score}`;
        }
    }
    
    // 更新关卡
    public setLevel(level: number): void {
        if (this.levelLabel) {
            this.levelLabel.string = `关卡: ${level}`;
        }
    }
    
    // 更新连击
    public updateCombo(combo: number): void {
        if (this.comboLabel) {
            if (combo > 0) {
                this.comboLabel.string = `连击: x${combo}`;
                this.comboLabel.node.active = true;
            } else {
                this.comboLabel.node.active = false;
            }
        }
    }
    
    // 更新病毒数量
    public updateVirusCount(count: number): void {
        if (this.virusLabel) {
            this.virusLabel.string = `病毒: ${count}`;
        }
    }
    
    // 更新下一个胶囊预览
    public updateNextCapsule(capsule: FallingCapsule): void {
        for (let i = 0; i < 2; i++) {
            const renderer = this.nextCapsuleRenderers[i];
            if (!renderer) continue;
            
            const color = i === 0 ? capsule.leftColor : capsule.rightColor;
            renderer.setCapsulePreview(color, i === 0);
        }
    }
    
    // 显示/隐藏暂停界面
    public showPauseOverlay(show: boolean): void {
        if (this.pauseOverlay) {
            this.pauseOverlay.active = show;
        }
    }
    
    // 显示胜利界面
    public showVictory(data: GameData): void {
        if (this.victoryOverlay) {
            this.victoryOverlay.active = true;
            
            // 更新胜利数据
            const scoreLabel = this.victoryOverlay.getChildByName('ScoreLabel')?.getComponent(Label);
            if (scoreLabel) {
                scoreLabel.string = `得分: ${data.score}`;
            }
        }
    }
    
    // 显示失败界面
    public showGameOver(data: GameData): void {
        if (this.gameOverOverlay) {
            this.gameOverOverlay.active = true;
            
            // 更新失败数据
            const scoreLabel = this.gameOverOverlay.getChildByName('ScoreLabel')?.getComponent(Label);
            if (scoreLabel) {
                scoreLabel.string = `得分: ${data.score}`;
            }
        }
    }
    
    // 隐藏所有弹窗
    public hideAllOverlays(): void {
        this.showPauseOverlay(false);
        if (this.victoryOverlay) this.victoryOverlay.active = false;
        if (this.gameOverOverlay) this.gameOverOverlay.active = false;
    }
    
    // 显示
    public show(): void {
        this.node.active = true;
        this.hideAllOverlays();
    }
    
    // 隐藏
    public hide(): void {
        this.node.active = false;
    }
    
    // 清空棋盘显示
    public clearBoard(): void {
        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                this.cellRenderers[row]?.[col]?.setEmpty();
            }
        }
    }
}
