/**
 * 双色胶囊 - 音效管理器
 * 负责背景音乐和音效的播放
 */

import { _decorator, Component, AudioSource, AudioClip, resources, Node } from 'cc';

const { ccclass, property } = _decorator;

export enum SoundType {
    // 音效
    CAPSULE_MOVE = 'capsule_move',
    CAPSULE_ROTATE = 'capsule_rotate',
    CAPSULE_LAND = 'capsule_land',
    MATCH = 'match',
    COMBO = 'combo',
    VICTORY = 'victory',
    GAME_OVER = 'game_over',
    BUTTON_CLICK = 'button_click',
    
    // 音乐
    BGM_MENU = 'bgm_menu',
    BGM_GAME = 'bgm_game'
}

@ccclass('AudioManager')
export class AudioManager extends Component {
    private static instance: AudioManager;
    
    @property(AudioSource)
    bgmSource: AudioSource | null = null;
    
    @property(AudioSource)
    sfxSource: AudioSource | null = null;
    
    // 音效缓存
    private clips: Map<string, AudioClip> = new Map();
    
    // 设置
    private bgmEnabled: boolean = true;
    private sfxEnabled: boolean = true;
    private bgmVolume: number = 0.5;
    private sfxVolume: number = 1.0;
    
    onLoad() {
        if (AudioManager.instance) {
            this.node.destroy();
            return;
        }
        
        AudioManager.instance = this;
        
        // 加载设置
        this.loadSettings();
        
        // 添加音频源（如果没有）
        if (!this.bgmSource) {
            this.bgmSource = this.node.addComponent(AudioSource);
            this.bgmSource.loop = true;
        }
        
        if (!this.sfxSource) {
            this.sfxSource = this.node.addComponent(AudioSource);
            this.sfxSource.loop = false;
        }
    }
    
    // 获取单例
    public static getInstance(): AudioManager {
        return AudioManager.instance;
    }
    
    // 加载设置
    private loadSettings(): void {
        try {
            const settings = localStorage.getItem('dual_capsule_audio');
            if (settings) {
                const data = JSON.parse(settings);
                this.bgmEnabled = data.bgmEnabled ?? true;
                this.sfxEnabled = data.sfxEnabled ?? true;
                this.bgmVolume = data.bgmVolume ?? 0.5;
                this.sfxVolume = data.sfxVolume ?? 1.0;
            }
        } catch (e) {
            console.error('Failed to load audio settings:', e);
        }
    }
    
    // 保存设置
    private saveSettings(): void {
        try {
            localStorage.setItem('dual_capsule_audio', JSON.stringify({
                bgmEnabled: this.bgmEnabled,
                sfxEnabled: this.sfxEnabled,
                bgmVolume: this.bgmVolume,
                sfxVolume: this.sfxVolume
            }));
        } catch (e) {
            console.error('Failed to save audio settings:', e);
        }
    }
    
    // 播放音效
    public playSFX(type: SoundType): void {
        if (!this.sfxEnabled || !this.sfxSource) return;
        
        const clip = this.clips.get(type);
        if (clip) {
            this.sfxSource.playOneShot(clip, this.sfxVolume);
        }
    }
    
    // 播放背景音乐
    public playBGM(type: SoundType): void {
        if (!this.bgmEnabled || !this.bgmSource) return;
        
        const clip = this.clips.get(type);
        if (clip) {
            this.bgmSource.stop();
            this.bgmSource.clip = clip;
            this.bgmSource.volume = this.bgmVolume;
            this.bgmSource.play();
        }
    }
    
    // 停止背景音乐
    public stopBGM(): void {
        this.bgmSource?.stop();
    }
    
    // 设置 BGM 开关
    public setBGMEnabled(enabled: boolean): void {
        this.bgmEnabled = enabled;
        if (enabled) {
            this.bgmSource?.play();
        } else {
            this.bgmSource?.stop();
        }
        this.saveSettings();
    }
    
    // 设置 SFX 开关
    public setSFXEnabled(enabled: boolean): void {
        this.sfxEnabled = enabled;
        this.saveSettings();
    }
    
    // 设置 BGM 音量
    public setBGMVolume(volume: number): void {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmSource) {
            this.bgmSource.volume = this.bgmVolume;
        }
        this.saveSettings();
    }
    
    // 设置 SFX 音量
    public setSFXVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    // 获取设置
    public isBGMEnabled(): boolean { return this.bgmEnabled; }
    public isSFXEnabled(): boolean { return this.sfxEnabled; }
    public getBGMVolume(): number { return this.bgmVolume; }
    public getSFXVolume(): number { return this.sfxVolume; }
    
    // 预加载音效
    public preloadClips(clips: { type: SoundType; path: string }[]): void {
        for (const { type, path } of clips) {
            resources.load(path, AudioClip, (err, clip) => {
                if (!err && clip) {
                    this.clips.set(type, clip);
                }
            });
        }
    }
}
