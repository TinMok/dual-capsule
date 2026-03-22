/**
 * 双色胶囊 - 棋盘管理
 * 负责棋盘状态管理、胶囊移动、消除检测
 */

import { 
    BOARD_COLS, BOARD_ROWS, 
    CapsuleColor, Rotation, Direction, 
    GameState, MIN_MATCH_COUNT, getLevelConfig 
} from './Constants';
import { Cell, Match, FallingCapsule, VirusData, GameData } from './Types';
import { MatchDetector } from './MatchDetector';

export class Board {
    // 棋盘网格
    private grid: Cell[][] = [];
    
    // 当前下落的胶囊
    private currentCapsule: FallingCapsule | null = null;
    
    // 下一个胶囊
    private nextCapsule: FallingCapsule | null = null;
    
    // 游戏状态
    private gameState: GameState = GameState.IDLE;
    
    // 游戏数据
    private gameData: GameData = {
        score: 0,
        level: 1,
        combo: 0,
        maxCombo: 0,
        virusesCleared: 0,
        capsulesUsed: 0
    };
    
    // 病毒列表
    private viruses: VirusData[] = [];
    
    // 消除检测器
    private matchDetector: MatchDetector;
    
    // 回调函数
    private onCellUpdate?: (row: number, col: number, cell: Cell) => void;
    private onScoreUpdate?: (score: number) => void;
    private onComboUpdate?: (combo: number) => void;
    private onGameStateChange?: (state: GameState) => void;
    private onCapsuleUpdate?: (capsule: FallingCapsule | null) => void;
    private onNextCapsuleUpdate?: (capsule: FallingCapsule) => void;
    
    constructor() {
        this.matchDetector = new MatchDetector();
        this.initGrid();
    }
    
    // 初始化网格
    private initGrid(): void {
        this.grid = [];
        for (let row = 0; row < BOARD_ROWS; row++) {
            this.grid[row] = [];
            for (let col = 0; col < BOARD_COLS; col++) {
                this.grid[row][col] = {
                    row,
                    col,
                    type: 'empty',
                    color: CapsuleColor.NONE,
                };
            }
        }
    }
    
    // 设置回调
    public setCallbacks(callbacks: {
        onCellUpdate?: (row: number, col: number, cell: Cell) => void;
        onScoreUpdate?: (score: number) => void;
        onComboUpdate?: (combo: number) => void;
        onGameStateChange?: (state: GameState) => void;
        onCapsuleUpdate?: (capsule: FallingCapsule | null) => void;
        onNextCapsuleUpdate?: (capsule: FallingCapsule) => void;
    }): void {
        this.onCellUpdate = callbacks.onCellUpdate;
        this.onScoreUpdate = callbacks.onScoreUpdate;
        this.onComboUpdate = callbacks.onComboUpdate;
        this.onGameStateChange = callbacks.onGameStateChange;
        this.onCapsuleUpdate = callbacks.onCapsuleUpdate;
        this.onNextCapsuleUpdate = callbacks.onNextCapsuleUpdate;
    }
    
    // 开始新游戏
    public startGame(level: number = 1): void {
        this.initGrid();
        this.viruses = [];
        
        this.gameData = {
            score: 0,
            level,
            combo: 0,
            maxCombo: 0,
            virusesCleared: 0,
            capsulesUsed: 0
        };
        
        // 生成病毒
        const config = getLevelConfig(level);
        this.spawnViruses(config.virusCount);
        
        // 生成第一个胶囊
        this.nextCapsule = this.createRandomCapsule();
        this.onNextCapsuleUpdate?.(this.nextCapsule);
        
        // 放入棋盘
        this.spawnNewCapsule();
        
        this.setGameState(GameState.PLAYING);
        this.notifyScoreUpdate();
    }
    
    // 生成病毒
    private spawnViruses(count: number): void {
        const colors = [CapsuleColor.RED, CapsuleColor.YELLOW, CapsuleColor.BLUE];
        
        // 病毒只在下半部分生成
        const minRow = Math.floor(BOARD_ROWS * 0.4);
        const maxRow = BOARD_ROWS - 1;
        
        let placed = 0;
        let attempts = 0;
        const maxAttempts = count * 20;
        
        while (placed < count && attempts < maxAttempts) {
            attempts++;
            
            const row = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
            const col = Math.floor(Math.random() * BOARD_COLS);
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // 检查位置是否为空
            if (this.grid[row][col].type === 'empty') {
                // 检查是否会形成初始消除（避免）
                if (!this.wouldCreateMatch(row, col, color)) {
                    this.grid[row][col] = {
                        row,
                        col,
                        type: 'virus',
                        color
                    };
                    
                    this.viruses.push({ row, col, color });
                    this.onCellUpdate?.(row, col, this.grid[row][col]);
                    placed++;
                }
            }
        }
    }
    
    // 检查放置颜色是否会形成消除
    private wouldCreateMatch(row: number, col: number, color: CapsuleColor): boolean {
        // 检查水平
        let hCount = 1;
        for (let c = col - 1; c >= 0; c--) {
            if (this.grid[row][c].color === color) hCount++;
            else break;
        }
        for (let c = col + 1; c < BOARD_COLS; c++) {
            if (this.grid[row][c].color === color) hCount++;
            else break;
        }
        
        // 检查垂直
        let vCount = 1;
        for (let r = row - 1; r >= 0; r--) {
            if (this.grid[r][col].color === color) vCount++;
            else break;
        }
        for (let r = row + 1; r < BOARD_ROWS; r++) {
            if (this.grid[r][col].color === color) vCount++;
            else break;
        }
        
        return hCount >= MIN_MATCH_COUNT || vCount >= MIN_MATCH_COUNT;
    }
    
    // 创建随机胶囊
    private createRandomCapsule(): FallingCapsule {
        const colors = [CapsuleColor.RED, CapsuleColor.YELLOW, CapsuleColor.BLUE];
        return {
            leftColor: colors[Math.floor(Math.random() * colors.length)],
            rightColor: colors[Math.floor(Math.random() * colors.length)],
            row: 0,
            col: Math.floor(BOARD_COLS / 2) - 1,
            rotation: Rotation.UP
        };
    }
    
    // 生成新胶囊到棋盘
    public spawnNewCapsule(): boolean {
        if (!this.nextCapsule) {
            this.nextCapsule = this.createRandomCapsule();
        }
        
        this.currentCapsule = {
            ...this.nextCapsule,
            row: 0,
            col: Math.floor(BOARD_COLS / 2) - 1,
            rotation: Rotation.UP
        };
        
        // 生成下一个胶囊
        this.nextCapsule = this.createRandomCapsule();
        this.onNextCapsuleUpdate?.(this.nextCapsule);
        
        // 检查是否可以放置
        if (!this.canPlaceCapsule(this.currentCapsule)) {
            this.setGameState(GameState.GAME_OVER);
            return false;
        }
        
        this.updateCapsuleOnGrid();
        this.onCapsuleUpdate?.(this.currentCapsule);
        this.gameData.capsulesUsed++;
        
        return true;
    }
    
    // 检查胶囊是否可以放置
    private canPlaceCapsule(capsule: FallingCapsule): boolean {
        const positions = this.getCapsulePositions(capsule);
        
        for (const pos of positions) {
            if (pos.row < 0 || pos.row >= BOARD_ROWS ||
                pos.col < 0 || pos.col >= BOARD_COLS) {
                return false;
            }
            
            const cell = this.grid[pos.row][pos.col];
            if (cell.type !== 'empty' && !this.isCurrentCapsuleCell(pos.row, pos.col)) {
                return false;
            }
        }
        
        return true;
    }
    
    // 检查是否是当前胶囊的格子
    private isCurrentCapsuleCell(row: number, col: number): boolean {
        if (!this.currentCapsule) return false;
        const positions = this.getCapsulePositions(this.currentCapsule);
        return positions.some(p => p.row === row && p.col === col);
    }
    
    // 获取胶囊的两个位置
    private getCapsulePositions(capsule: FallingCapsule): { row: number; col: number }[] {
        const { row, col, rotation } = capsule;
        
        switch (rotation) {
            case Rotation.UP:    // 水平
                return [{ row, col }, { row, col: col + 1 }];
            case Rotation.RIGHT: // 垂直，下
                return [{ row, col }, { row: row + 1, col }];
            case Rotation.DOWN:  // 水平，反向
                return [{ row, col: col + 1 }, { row, col }];
            case Rotation.LEFT:  // 垂直，上
                return [{ row: row + 1, col }, { row, col }];
            default:
                return [{ row, col }, { row, col: col + 1 }];
        }
    }
    
    // 更新胶囊在网格上的显示
    private updateCapsuleOnGrid(): void {
        if (!this.currentCapsule) return;
        
        const positions = this.getCapsulePositions(this.currentCapsule);
        const colors = this.getCapsuleColors(this.currentCapsule);
        
        for (let i = 0; i < 2; i++) {
            const pos = positions[i];
            const color = colors[i];
            
            this.grid[pos.row][pos.col] = {
                row: pos.row,
                col: pos.col,
                type: i === 0 ? 'capsule_left' : 'capsule_right',
                color,
                linkedCell: positions[1 - i]
            };
            
            this.onCellUpdate?.(pos.row, pos.col, this.grid[pos.row][pos.col]);
        }
    }
    
    // 获取胶囊的颜色（根据旋转）
    private getCapsuleColors(capsule: FallingCapsule): CapsuleColor[] {
        const { leftColor, rightColor, rotation } = capsule;
        
        switch (rotation) {
            case Rotation.UP:
                return [leftColor, rightColor];
            case Rotation.RIGHT:
                return [leftColor, rightColor];
            case Rotation.DOWN:
                return [rightColor, leftColor];
            case Rotation.LEFT:
                return [rightColor, leftColor];
            default:
                return [leftColor, rightColor];
        }
    }
    
    // 清除胶囊在网格上的显示
    private clearCapsuleFromGrid(): void {
        if (!this.currentCapsule) return;
        
        const positions = this.getCapsulePositions(this.currentCapsule);
        for (const pos of positions) {
            if (pos.row >= 0 && pos.row < BOARD_ROWS &&
                pos.col >= 0 && pos.col < BOARD_COLS) {
                this.grid[pos.row][pos.col] = {
                    row: pos.row,
                    col: pos.col,
                    type: 'empty',
                    color: CapsuleColor.NONE
                };
                this.onCellUpdate?.(pos.row, pos.col, this.grid[pos.row][pos.col]);
            }
        }
    }
    
    // 移动胶囊
    public moveCapsule(direction: Direction): boolean {
        if (!this.currentCapsule || this.gameState !== GameState.PLAYING) {
            return false;
        }
        
        this.clearCapsuleFromGrid();
        
        const newCapsule = { ...this.currentCapsule };
        
        switch (direction) {
            case Direction.LEFT:
                newCapsule.col--;
                break;
            case Direction.RIGHT:
                newCapsule.col++;
                break;
            case Direction.DOWN:
                newCapsule.row++;
                break;
        }
        
        if (this.canPlaceCapsule(newCapsule)) {
            this.currentCapsule = newCapsule;
            this.updateCapsuleOnGrid();
            this.onCapsuleUpdate?.(this.currentCapsule);
            return true;
        } else {
            this.updateCapsuleOnGrid();
            return false;
        }
    }
    
    // 旋转胶囊
    public rotateCapsule(clockwise: boolean = true): boolean {
        if (!this.currentCapsule || this.gameState !== GameState.PLAYING) {
            return false;
        }
        
        this.clearCapsuleFromGrid();
        
        const newCapsule = { ...this.currentCapsule };
        const delta = clockwise ? 90 : -90;
        newCapsule.rotation = ((newCapsule.rotation + delta) + 360) % 360 as Rotation;
        
        // 尝试旋转
        if (this.canPlaceCapsule(newCapsule)) {
            this.currentCapsule = newCapsule;
            this.updateCapsuleOnGrid();
            this.onCapsuleUpdate?.(this.currentCapsule);
            return true;
        }
        
        // 尝试墙踢（wall kick）
        const kicks = [Direction.LEFT, Direction.RIGHT];
        for (const kick of kicks) {
            const kickedCapsule = { ...newCapsule };
            kickedCapsule.col += kick === Direction.LEFT ? -1 : 1;
            
            if (this.canPlaceCapsule(kickedCapsule)) {
                this.currentCapsule = kickedCapsule;
                this.updateCapsuleOnGrid();
                this.onCapsuleUpdate?.(this.currentCapsule);
                return true;
            }
        }
        
        // 旋转失败，恢复原状
        this.updateCapsuleOnGrid();
        return false;
    }
    
    // 胶囊下落一帧
    public tick(): void {
        if (this.gameState !== GameState.PLAYING || !this.currentCapsule) {
            return;
        }
        
        if (!this.moveCapsule(Direction.DOWN)) {
            // 无法下落，锁定胶囊
            this.lockCapsule();
        }
    }
    
    // 快速下落
    public hardDrop(): void {
        if (this.gameState !== GameState.PLAYING || !this.currentCapsule) {
            return;
        }
        
        while (this.moveCapsule(Direction.DOWN)) {
            // 继续下落
        }
        
        this.lockCapsule();
    }
    
    // 锁定胶囊
    private lockCapsule(): void {
        if (!this.currentCapsule) return;
        
        // 胶囊固定在当前位置
        const positions = this.getCapsulePositions(this.currentCapsule);
        const colors = this.getCapsuleColors(this.currentCapsule);
        
        for (let i = 0; i < 2; i++) {
            const pos = positions[i];
            this.grid[pos.row][pos.col] = {
                row: pos.row,
                col: pos.col,
                type: i === 0 ? 'capsule_left' : 'capsule_right',
                color: colors[i],
                linkedCell: positions[1 - i]
            };
        }
        
        this.currentCapsule = null;
        this.onCapsuleUpdate?.(null);
        
        // 检测消除
        this.processMatches();
    }
    
    // 处理消除
    private async processMatches(): Promise<void> {
        let hasMatches = true;
        this.gameData.combo = 0;
        
        while (hasMatches) {
            const matches = this.matchDetector.findMatches(this.grid);
            
            if (matches.length > 0) {
                this.gameData.combo++;
                if (this.gameData.combo > this.gameData.maxCombo) {
                    this.gameData.maxCombo = this.gameData.combo;
                }
                
                // 移除匹配的方块
                await this.removeMatches(matches);
                
                // 应用重力
                await this.applyGravity();
                
                // 更新分数
                this.calculateScore(matches);
                this.notifyScoreUpdate();
                this.onComboUpdate?.(this.gameData.combo);
            } else {
                hasMatches = false;
            }
        }
        
        this.gameData.combo = 0;
        this.onComboUpdate?.(0);
        
        // 检查胜利条件
        if (this.checkVictory()) {
            this.setGameState(GameState.VICTORY);
            return;
        }
        
        // 生成新胶囊
        this.spawnNewCapsule();
    }
    
    // 移除匹配的方块
    private async removeMatches(matches: Match[]): Promise<void> {
        for (const match of matches) {
            for (const cell of match.cells) {
                const gridCell = this.grid[cell.row][cell.col];
                
                // 如果是病毒，从列表移除
                if (gridCell.type === 'virus') {
                    this.viruses = this.viruses.filter(
                        v => !(v.row === cell.row && v.col === cell.col)
                    );
                    this.gameData.virusesCleared++;
                }
                
                // 如果是胶囊，断开关联
                if (gridCell.linkedCell) {
                    const linked = gridCell.linkedCell;
                    this.grid[linked.row][linked.col].linkedCell = undefined;
                }
                
                // 清空格子
                this.grid[cell.row][cell.col] = {
                    row: cell.row,
                    col: cell.col,
                    type: 'empty',
                    color: CapsuleColor.NONE
                };
                
                this.onCellUpdate?.(cell.row, cell.col, this.grid[cell.row][cell.col]);
            }
        }
        
        // 等待消除动画（由 UI 层实现）
        await this.delay(100);
    }
    
    // 应用重力
    private async applyGravity(): Promise<void> {
        let moved = true;
        
        while (moved) {
            moved = false;
            
            for (let col = 0; col < BOARD_COLS; col++) {
                for (let row = BOARD_ROWS - 2; row >= 0; row--) {
                    const cell = this.grid[row][col];
                    
                    if (cell.type !== 'empty' && cell.type !== 'virus') {
                        // 检查下方是否为空
                        const belowRow = row + 1;
                        if (belowRow < BOARD_ROWS && this.grid[belowRow][col].type === 'empty') {
                            // 移动方块下落
                            this.grid[belowRow][col] = {
                                ...cell,
                                row: belowRow
                            };
                            
                            // 更新关联格子的位置
                            if (cell.linkedCell) {
                                const linked = cell.linkedCell;
                                const linkedCell = this.grid[linked.row][linked.col];
                                if (linkedCell.linkedCell) {
                                    linkedCell.linkedCell = { row: belowRow, col };
                                }
                            }
                            
                            this.grid[row][col] = {
                                row,
                                col,
                                type: 'empty',
                                color: CapsuleColor.NONE
                            };
                            
                            this.onCellUpdate?.(row, col, this.grid[row][col]);
                            this.onCellUpdate?.(belowRow, col, this.grid[belowRow][col]);
                            
                            moved = true;
                        }
                    }
                }
            }
        }
    }
    
    // 计算分数
    private calculateScore(matches: Match[]): void {
        let baseScore = 0;
        
        for (const match of matches) {
            // 基础分：消除数量
            if (match.count === 4) baseScore += 100;
            else if (match.count === 5) baseScore += 200;
            else baseScore += 300;
            
            // 病毒额外分
            const virusCount = match.cells.filter(
                c => this.grid[c.row]?.[c.col]?.type === 'virus'
            ).length;
            baseScore += virusCount * 50;
        }
        
        // 连锁倍率
        const comboMultiplier = this.getComboMultiplier();
        this.gameData.score += Math.floor(baseScore * comboMultiplier);
    }
    
    // 获取连锁倍率
    private getComboMultiplier(): number {
        const combo = this.gameData.combo;
        if (combo <= 1) return 1;
        if (combo === 2) return 1.5;
        if (combo === 3) return 2;
        if (combo === 4) return 3;
        return 5;
    }
    
    // 检查胜利
    private checkVictory(): boolean {
        return this.viruses.length === 0;
    }
    
    // 设置游戏状态
    private setGameState(state: GameState): void {
        this.gameState = state;
        this.onGameStateChange?.(state);
    }
    
    // 通知分数更新
    private notifyScoreUpdate(): void {
        this.onScoreUpdate?.(this.gameData.score);
    }
    
    // 延迟
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 暂停游戏
    public pause(): void {
        if (this.gameState === GameState.PLAYING) {
            this.setGameState(GameState.PAUSED);
        }
    }
    
    // 继续游戏
    public resume(): void {
        if (this.gameState === GameState.PAUSED) {
            this.setGameState(GameState.PLAYING);
        }
    }
    
    // 获取游戏数据
    public getGameData(): GameData {
        return { ...this.gameData };
    }
    
    // 获取当前状态
    public getGameState(): GameState {
        return this.gameState;
    }
    
    // 获取病毒数量
    public getVirusCount(): number {
        return this.viruses.length;
    }
    
    // 获取网格（用于渲染）
    public getGrid(): Cell[][] {
        return this.grid;
    }
    
    // 获取当前胶囊
    public getCurrentCapsule(): FallingCapsule | null {
        return this.currentCapsule;
    }
    
    // 获取下一个胶囊
    public getNextCapsule(): FallingCapsule | null {
        return this.nextCapsule;
    }
}
