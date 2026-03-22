/**
 * 双色胶囊 - 消除检测器
 * 负责检测棋盘上的消除匹配
 */

import { BOARD_COLS, BOARD_ROWS, MIN_MATCH_COUNT, CapsuleColor } from './Constants';
import { Cell, Match } from './Types';

export class MatchDetector {
    /**
     * 查找所有匹配
     */
    public findMatches(grid: Cell[][]): Match[] {
        const matches: Match[] = [];
        const visited = new Set<string>();
        
        // 查找水平匹配
        for (let row = 0; row < BOARD_ROWS; row++) {
            const rowMatches = this.findHorizontalMatches(grid, row, visited);
            matches.push(...rowMatches);
        }
        
        // 查找垂直匹配
        for (let col = 0; col < BOARD_COLS; col++) {
            const colMatches = this.findVerticalMatches(grid, col, visited);
            matches.push(...colMatches);
        }
        
        return this.mergeOverlappingMatches(matches);
    }
    
    /**
     * 查找水平匹配
     */
    private findHorizontalMatches(
        grid: Cell[][], 
        row: number, 
        visited: Set<string>
    ): Match[] {
        const matches: Match[] = [];
        let col = 0;
        
        while (col < BOARD_COLS) {
            const cell = grid[row][col];
            
            // 跳过空格
            if (cell.type === 'empty' || cell.color === CapsuleColor.NONE) {
                col++;
                continue;
            }
            
            const color = cell.color;
            const matchCells: { row: number; col: number }[] = [];
            
            // 向右查找同色方块
            let c = col;
            while (c < BOARD_COLS) {
                const currentCell = grid[row][c];
                if (currentCell.color === color && currentCell.type !== 'empty') {
                    matchCells.push({ row, col: c });
                    c++;
                } else {
                    break;
                }
            }
            
            // 检查是否满足消除条件
            if (matchCells.length >= MIN_MATCH_COUNT) {
                matches.push({
                    cells: matchCells,
                    color,
                    count: matchCells.length
                });
                
                // 标记已访问
                for (const cell of matchCells) {
                    visited.add(`${cell.row},${cell.col}`);
                }
            }
            
            col = c;
        }
        
        return matches;
    }
    
    /**
     * 查找垂直匹配
     */
    private findVerticalMatches(
        grid: Cell[][], 
        col: number, 
        visited: Set<string>
    ): Match[] {
        const matches: Match[] = [];
        let row = 0;
        
        while (row < BOARD_ROWS) {
            const cell = grid[row][col];
            
            // 跳过空格
            if (cell.type === 'empty' || cell.color === CapsuleColor.NONE) {
                row++;
                continue;
            }
            
            const color = cell.color;
            const matchCells: { row: number; col: number }[] = [];
            
            // 向下查找同色方块
            let r = row;
            while (r < BOARD_ROWS) {
                const currentCell = grid[r][col];
                if (currentCell.color === color && currentCell.type !== 'empty') {
                    matchCells.push({ row: r, col });
                    r++;
                } else {
                    break;
                }
            }
            
            // 检查是否满足消除条件
            if (matchCells.length >= MIN_MATCH_COUNT) {
                matches.push({
                    cells: matchCells,
                    color,
                    count: matchCells.length
                });
                
                // 标记已访问
                for (const cell of matchCells) {
                    visited.add(`${cell.row},${cell.col}`);
                }
            }
            
            row = r;
        }
        
        return matches;
    }
    
    /**
     * 合并重叠的匹配（同一个方块可能同时在水平和垂直匹配中）
     */
    private mergeOverlappingMatches(matches: Match[]): Match[] {
        if (matches.length === 0) return [];
        
        const result: Match[] = [];
        const allCells = new Map<string, { row: number; col: number; color: CapsuleColor }>();
        
        // 收集所有需要消除的格子
        for (const match of matches) {
            for (const cell of match.cells) {
                const key = `${cell.row},${cell.col}`;
                allCells.set(key, { ...cell, color: match.color });
            }
        }
        
        // 按颜色分组
        const byColor = new Map<CapsuleColor, { row: number; col: number }[]>();
        for (const [key, cell] of allCells) {
            if (!byColor.has(cell.color)) {
                byColor.set(cell.color, []);
            }
            byColor.get(cell.color)!.push({ row: cell.row, col: cell.col });
        }
        
        // 创建合并后的匹配
        for (const [color, cells] of byColor) {
            result.push({
                cells,
                color,
                count: cells.length
            });
        }
        
        return result;
    }
    
    /**
     * 检查特定位置是否在匹配中
     */
    public isPartOfMatch(grid: Cell[][], row: number, col: number): boolean {
        const cell = grid[row]?.[col];
        if (!cell || cell.type === 'empty') return false;
        
        // 检查水平
        let hCount = 1;
        for (let c = col - 1; c >= 0; c--) {
            if (grid[row][c].color === cell.color) hCount++;
            else break;
        }
        for (let c = col + 1; c < BOARD_COLS; c++) {
            if (grid[row][c].color === cell.color) hCount++;
            else break;
        }
        
        if (hCount >= MIN_MATCH_COUNT) return true;
        
        // 检查垂直
        let vCount = 1;
        for (let r = row - 1; r >= 0; r--) {
            if (grid[r][col].color === cell.color) vCount++;
            else break;
        }
        for (let r = row + 1; r < BOARD_ROWS; r++) {
            if (grid[r][col].color === cell.color) vCount++;
            else break;
        }
        
        return vCount >= MIN_MATCH_COUNT;
    }
}
