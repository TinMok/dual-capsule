/**
 * 双色胶囊 - 对象池
 * 用于复用节点，减少创建/销毁开销
 */

import { Node, instantiate, Prefab } from 'cc';

export class ObjectPool {
    private pool: Node[] = [];
    private prefab: Prefab;
    private parent: Node | null;
    private expandSize: number;
    
    constructor(prefab: Prefab, parent: Node | null = null, initialSize: number = 10, expandSize: number = 5) {
        this.prefab = prefab;
        this.parent = parent;
        this.expandSize = expandSize;
        
        // 预创建对象
        this.expand(initialSize);
    }
    
    // 扩展池
    private expand(count: number): void {
        for (let i = 0; i < count; i++) {
            const node = instantiate(this.prefab);
            node.active = false;
            if (this.parent) {
                node.setParent(this.parent);
            }
            this.pool.push(node);
        }
    }
    
    // 获取对象
    public get(): Node {
        if (this.pool.length === 0) {
            this.expand(this.expandSize);
        }
        
        const node = this.pool.pop()!;
        node.active = true;
        return node;
    }
    
    // 归还对象
    public put(node: Node): void {
        node.active = false;
        if (this.parent && node.parent !== this.parent) {
            node.setParent(this.parent);
        }
        this.pool.push(node);
    }
    
    // 清空池
    public clear(): void {
        for (const node of this.pool) {
            node.destroy();
        }
        this.pool.length = 0;
    }
    
    // 获取池大小
    public size(): number {
        return this.pool.length;
    }
}

/**
 * 多类型对象池管理器
 */
export class ObjectPoolManager {
    private pools: Map<string, ObjectPool> = new Map();
    
    // 注册对象池
    public register(name: string, prefab: Prefab, parent: Node | null = null, initialSize: number = 10): void {
        if (!this.pools.has(name)) {
            this.pools.set(name, new ObjectPool(prefab, parent, initialSize));
        }
    }
    
    // 获取对象
    public get(name: string): Node | null {
        const pool = this.pools.get(name);
        return pool ? pool.get() : null;
    }
    
    // 归还对象
    public put(name: string, node: Node): void {
        const pool = this.pools.get(name);
        if (pool) {
            pool.put(node);
        } else {
            node.destroy();
        }
    }
    
    // 清空所有池
    public clearAll(): void {
        for (const pool of this.pools.values()) {
            pool.clear();
        }
        this.pools.clear();
    }
    
    // 清空指定池
    public clear(name: string): void {
        const pool = this.pools.get(name);
        if (pool) {
            pool.clear();
            this.pools.delete(name);
        }
    }
}
