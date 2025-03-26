
import { GameObject } from './types'; 

export class GameState {
  public playerScore: number = 0;
  public cpuScore: number = 0;
  public failCount: number = 0;
  public winTarget: number | undefined;
  public highScore: number = 0;
  public gameStarted: boolean = false;
  public difficulty: "normal" | "hard" = "normal";
  public playerChoiceHistory: GameObject[] = [];
  public bgmMuted: boolean = false;
  public gamePoints: number = 0;
  public playerLives: number = 10;
  public newPoints: number = 0;
  public isRoundActive: boolean = false;
  public objDTriggerCount: number = 0;
  public objDActive: boolean = false;
  public lastCheckedWins: number = 0;

  public sounds: { [key: string]: HTMLAudioElement } = {
    select: new Audio('/PokeFanBattle/Assets/Audio/select.wav'),
    win: new Audio('/PokeFanBattle/Assets/Audio/win.wav'),
    lose: new Audio('/PokeFanBattle/Assets/Audio/lose.wav'),
    tie: new Audio('/PokeFanBattle/Assets/Audio/tie.wav'),
    'end-win': new Audio('/PokeFanBattle/Assets/Audio/end-win.wav'),
    'end-lose': new Audio('/PokeFanBattle/Assets/Audio/end-lose.wav'),
    opening: new Audio('/PokeFanBattle/Assets/Audio/opening.wav'),
    'sound-a': new Audio('/PokeFanBattle/Assets/Audio/sound-a.ogg'),
    'sound-b': new Audio('/PokeFanBattle/Assets/Audio/sound-b.ogg'),
    'sound-c': new Audio('/PokeFanBattle/Assets/Audio/sound-c.ogg'),
    'objD1': new Audio('/PokeFanBattle/Assets/Audio/sound_objD_1.wav'),
    'objD2': new Audio('/PokeFanBattle/Assets/Audio/sound_objD_2.wav'),
    'life-up': new Audio('/PokeFanBattle/Assets/Audio/life-up.wav'),
  };
  public bgm: { [key: string]: HTMLAudioElement } = {
    opening: new Audio('/PokeFanBattle/Assets/Audio/opening-bgm.ogg'),
    battle: new Audio('/PokeFanBattle/Assets/Audio/battle-bgm.ogg'),
    end: new Audio('/PokeFanBattle/Assets/Audio/end-bgm.ogg'),
  };
  public audioContext: AudioContext;
  public bgmSource: AudioBufferSourceNode | null = null;
  public gainNode: GainNode;
  public currentBgmKey: string | null = null;

  public objectNames: { [key in GameObject]: string } = {
    [GameObject.A]: "A",
    [GameObject.B]: "B",
    [GameObject.C]: "C",
    [GameObject.D]: "D",
  };
  public playerImages: { [key in GameObject]: string } = {
    [GameObject.A]: '/PokeFanBattle/Assets/Img/choiced_a_400.png',
    [GameObject.B]: '/PokeFanBattle/Assets/Img/choiced_b_400.png',
    [GameObject.C]: '/PokeFanBattle/Assets/Img/choiced_c_400.png',
    [GameObject.D]: '/PokeFanBattle/Assets/Img/img_objD_400.png',
  };
  public cpuImages: { [key in GameObject]: string } = {
    [GameObject.A]: '/PokeFanBattle/Assets/Img/choiced_a_cpu400.png',
    [GameObject.B]: '/PokeFanBattle/Assets/Img/choiced_b_cpu400.png',
    [GameObject.C]: '/PokeFanBattle/Assets/Img/choiced_c_cpu400.png',
    [GameObject.D]: "",
  };
  public objectButtonImages: { [key in GameObject]: string } = {
    [GameObject.A]: '/PokeFanBattle/Assets/Img/icon_a_60.png',
    [GameObject.B]: '/PokeFanBattle/Assets/Img/icon_b_60.png',
    [GameObject.C]: '/PokeFanBattle/Assets/Img/icon_c_60.png',
    [GameObject.D]: "",
  };

  public playerCanvas: HTMLCanvasElement;
  public cpuCanvas: HTMLCanvasElement;
  public playerCtx: CanvasRenderingContext2D;
  public cpuCtx: CanvasRenderingContext2D;
  public animationFrameId: number | null = null;

  constructor() {
    this.loadHighScore();
    this.loadGamePoints();

    Object.values(this.sounds).forEach(sound => sound.volume = 0.5);
    Object.values(this.bgm).forEach(bgm => {
      bgm.volume = 0.3;
      bgm.loop = true;
    });

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.3;

    this.playerCanvas = document.getElementById("playerCanvas") as HTMLCanvasElement;
    this.cpuCanvas = document.getElementById("cpuCanvas") as HTMLCanvasElement;
    console.log("Player Canvas:", this.playerCanvas); // 检查是否找到
    console.log("CPU Canvas:", this.cpuCanvas);
    this.playerCtx = this.playerCanvas.getContext("2d")!;
    this.cpuCtx = this.cpuCanvas.getContext("2d")!;
    console.log("Player Context:", this.playerCtx); // 检查上下文
    console.log("CPU Context:", this.cpuCtx);
    this.playerCanvas.width = 300;
    this.playerCanvas.height = 300;
    this.cpuCanvas.width = 300;
    this.cpuCanvas.height = 300;
  }

  loadHighScore() { this.highScore = parseInt(localStorage.getItem("highScore") || "0"); }
  saveHighScore() { localStorage.setItem("highScore", this.highScore.toString()); }
  loadGamePoints() {
    this.gamePoints = parseInt(localStorage.getItem("gamePoints") || "0");
  }
  saveGamePoints() { localStorage.setItem("gamePoints", this.gamePoints.toString()); }
}

export const gameState = new GameState();