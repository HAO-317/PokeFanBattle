
import { GameState, gameState } from './state';
import { GameLogic, gameLogic } from './gameLogic';
import { UIManager, uiManager } from './uiManager';
import { GameObject } from './types';

export class EventHandler {
  private state: GameState;
  private logic: GameLogic;
  private ui: UIManager;

  constructor(state: GameState, logic: GameLogic, ui: UIManager) {
    this.state = state;
    this.logic = logic;
    this.ui = ui;
    this.setupEventListeners();
  }

  public setupEvents(): void {
    // 事件初始化逻辑
  }

  playOpening() {
    console.log("Playing opening sound and BGM");
    this.state.sounds.opening.currentTime = 0;
    this.state.sounds.opening.play();
    this.playBgm('opening');
  }

  async playBgm(key: 'opening' | 'battle' | 'end') {
    if (this.state.bgmMuted) return;
    if (this.state.bgmSource) {
      this.fadeOutBgm(() => this.startNewBgm(key));
    } else {
      this.startNewBgm(key);
    }
  }

  async startNewBgm(key: 'opening' | 'battle' | 'end') {
    if (this.state.bgmSource) {
      this.state.bgmSource.stop();
      this.state.bgmSource.disconnect();
    }
    const response = await fetch(this.state.bgm[key].src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.state.audioContext.decodeAudioData(arrayBuffer);
    this.state.bgmSource = this.state.audioContext.createBufferSource();
    this.state.bgmSource.buffer = audioBuffer;
    this.state.bgmSource.loop = true;
    this.state.bgmSource.connect(this.state.gainNode);
    this.state.currentBgmKey = key;
    this.state.bgmSource.start();
    this.fadeInBgm();
  }

  fadeInBgm() {
    const fadeDuration = 1;
    this.state.gainNode.gain.setValueAtTime(0, this.state.audioContext.currentTime);
    this.state.gainNode.gain.linearRampToValueAtTime(0.3, this.state.audioContext.currentTime + fadeDuration);
  }

  fadeOutBgm(callback: () => void) {
    const fadeDuration = 1;
    this.state.gainNode.gain.linearRampToValueAtTime(0, this.state.audioContext.currentTime + fadeDuration);
    setTimeout(() => {
      if (this.state.bgmSource) {
        this.state.bgmSource.stop();
        this.state.bgmSource.disconnect();
        this.state.bgmSource = null;
      }
      callback();
    }, fadeDuration * 1000);
  }

  stopBgm() {
    if (this.state.bgmSource) {
      this.fadeOutBgm(() => {
        this.state.bgmSource = null;
        this.state.currentBgmKey = null;
      });
    }
  }

  playSelectSound() {
    console.log("Playing select sound");
    this.state.sounds.select.currentTime = 0;
    this.state.sounds.select.play();
  }

  setupEventListeners() {
    console.log("Setting up event listeners");
    const goalModeButton = document.getElementById("goal-mode")!;
    const infinityButton = document.getElementById("winInfinity")!;
    const goalOptions = document.getElementById("goal-options")!;
    const difficultyToggle = document.querySelector(".difficulty-toggle")!;
    const startButton = document.getElementById("start")!;
    const difficultyNormal = document.getElementById("difficulty-normal")!;
    const difficultyHard = document.getElementById("difficulty-hard")!;
    // 新增：退出按钮和弹窗按钮
    const exitButton = document.querySelector('.exit-button') as HTMLButtonElement;
    const cancelExitButton = document.querySelector('#cancelExit') as HTMLButtonElement;
    const confirmExitButton = document.querySelector('#confirmExit') as HTMLButtonElement;

    // 点击退出按钮，显示弹窗
    if (exitButton) {
      exitButton.addEventListener('click', () => {
        this.playSelectSound();
        this.ui.showExitModal();
      });
    }

    // 点击取消，关闭弹窗
    if (cancelExitButton) {
      cancelExitButton.addEventListener('click', () => {
        this.playSelectSound();
        this.ui.hideExitModal();
      });
    }

    // 点击确认，退出游戏
    if (confirmExitButton) {
      confirmExitButton.addEventListener('click', () => {
        this.playSelectSound();
        this.ui.exitGame();
        this.resetGame(); // 重置游戏状态
      });
    }

    document.addEventListener('click', (event: MouseEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      const ripple = document.createElement('div');
      ripple.classList.add('ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    });

    goalModeButton.addEventListener("click", () => {
      this.playSelectSound();
      this.playOpening();
      infinityButton.classList.add("hidden");
      goalOptions.classList.remove("hidden");
      goalOptions.classList.add("visible");
      console.log("Goal mode selected, showing options");
    });

    infinityButton.addEventListener("click", () => {
      this.playSelectSound();
      this.setWinTarget(0);
      goalModeButton.classList.add("hidden");
      infinityButton.classList.add("hidden");
      difficultyToggle.classList.remove("hidden");
      document.getElementById("startScreen")!.querySelector("h2")!.textContent = "You have chosen: INFINITY";
      console.log("Infinity mode selected, showing difficulty options");
    });

    const goalOptionButtons = document.querySelectorAll(".goal-option");
    goalOptionButtons.forEach(button => {
      button.addEventListener("click", () => {
        this.playSelectSound();
        const wins = parseInt(button.getAttribute("data-wins")!);
        this.setWinTarget(wins);
        goalOptionButtons.forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");
        goalModeButton.classList.add("hidden");
        goalOptions.classList.remove("visible");
        goalOptions.classList.add("hidden");
        startButton.classList.remove("hidden");
        document.getElementById("startScreen")!.querySelector("h2")!.textContent = `You have chosen: ${wins}x WIN`;
        console.log(`Goal option selected: ${wins} wins, showing start button`);
      });
    });

    difficultyNormal.addEventListener("click", () => {
      this.playSelectSound();
      this.state.difficulty = "normal";
      difficultyNormal.classList.add("selected");
      difficultyHard.classList.remove("selected");
      difficultyToggle.classList.add("hidden");
      startButton.classList.remove("hidden");
      console.log("Difficulty set to Normal, showing start button");
    });

    difficultyHard.addEventListener("click", () => {
      this.playSelectSound();
      this.state.difficulty = "hard";
      difficultyHard.classList.add("selected");
      difficultyNormal.classList.remove("selected");
      difficultyToggle.classList.add("hidden");
      startButton.classList.remove("hidden");
      console.log("Difficulty set to Hard, showing start button");
    });

    startButton.addEventListener("click", () => {
      if (this.state.winTarget === undefined) {
        alert("Please choose a game mode first!");
        return;
      }
      this.playSelectSound();
      this.startGame();
    });

    const soundControls = [
      document.getElementById("startSoundControl"),
      document.getElementById("gameSoundControl"),
      document.getElementById("endSoundControl")
    ];
    soundControls.forEach(control => {
      if (control) control.addEventListener("click", () => this.toggleBgm());
    });

    document.getElementById("objA")!.addEventListener("click", () => this.playRound(GameObject.A));
    document.getElementById("objB")!.addEventListener("click", () => this.playRound(GameObject.B));
    document.getElementById("objC")!.addEventListener("click", () => this.playRound(GameObject.C));
    document.getElementById("restart")!.addEventListener("click", () => this.resetGame());
  }

  setWinTarget(target: number) {
    if (!this.state.gameStarted) {
      this.state.winTarget = target;
      console.log(`Win target set to: ${target}`);
      document.getElementById("startScreen")!.querySelector("h2")!.textContent = 
        `You have choosen a Goal: ${target === 0 ? "INFINITY" : `${target}x WIN`}`;
    }
  }

  startGame() {
    if (this.state.winTarget === undefined) {
      console.log("Win target not set");
      alert("Please choose a victory goal first！");
      return;
    }
    console.log("Starting game");
    this.state.playerScore = 0;
    this.state.cpuScore = 0;
    this.state.failCount = 0;
    this.state.gameStarted = true;
    this.state.isRoundActive = false;
    this.state.playerChoiceHistory = [];
    this.state.playerLives = this.state.winTarget === 0 && this.state.difficulty === "normal" ? 15 : 10;
    this.state.newPoints = 0;
    this.state.objDTriggerCount = 0;
    this.state.objDActive = false;
    this.state.lastCheckedWins = 0;
    this.ui.toggleScreens("gameScreen");
    this.ui.updateScore();
    this.ui.updateHighScoreDisplay();
    this.ui.updateGamePoints();
    this.ui.initializeLives();
    document.getElementById("objA")!.style.backgroundImage = `url('${this.state.objectButtonImages[GameObject.A]}')`;
    document.getElementById("objB")!.style.backgroundImage = `url('${this.state.objectButtonImages[GameObject.B]}')`;
    document.getElementById("objC")!.style.backgroundImage = `url('${this.state.objectButtonImages[GameObject.C]}')`;
    this.playBgm('battle');
  }

  async playRound(playerChoice: GameObject) {
    if (!this.state.gameStarted || this.state.isRoundActive) return;
    this.state.isRoundActive = true;
    this.playSelectSound();
    const playerVersus = document.getElementById("playerVersus")!;
    const cpuVersus = document.getElementById("cpuVersus")!;
    playerVersus.style.backgroundImage = "none";
    cpuVersus.style.backgroundImage = "none";
    playerVersus.className = "choice-display";
    cpuVersus.className = "choice-display";
    if (this.state.animationFrameId) {
      cancelAnimationFrame(this.state.animationFrameId);
      this.state.animationFrameId = null;
    }
    this.state.playerCtx.clearRect(0, 0, this.state.playerCanvas.width, this.state.playerCanvas.height);
    this.state.cpuCtx.clearRect(0, 0, this.state.cpuCanvas.width, this.state.cpuCanvas.height);
    const gameScreen = document.getElementById("gameScreen2")!;
    const flyingBall = document.createElement("div");
    flyingBall.classList.add("flying-ball");
    gameScreen.appendChild(flyingBall);
    const playerCanvas = document.getElementById("playerCanvas")!;
    const gameScreenRect = gameScreen.getBoundingClientRect();
    const canvasRect = playerCanvas.getBoundingClientRect();
    const canvasCenterX = canvasRect.left - gameScreenRect.left + canvasRect.width / 2;
    const canvasCenterY = canvasRect.top - gameScreenRect.top + canvasRect.height / 2;
    const startX = 10;
    const startY = gameScreenRect.height - 10;
    const translateX = canvasCenterX - startX;
    const translateY = -(startY - canvasCenterY);
    flyingBall.style.setProperty("--fly-end-transform", `translate(${translateX - 40}px, ${translateY + 10}px) scale(0.33)`);
    flyingBall.style.setProperty("--vanish-mid-transform", `translate(${translateX - 40}px, ${translateY + 15}px) scale(1)`);
    flyingBall.style.setProperty("--vanish-end-transform", `translate(${translateX - 40}px, ${translateY + 20}px) scale(2)`);
    flyingBall.style.animation = "flyArc 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards";
    setTimeout(() => {
      flyingBall.style.animation = "vanishEffect 0.4s ease-in-out forwards";
      setTimeout(() => flyingBall.remove(), 400);
    }, 800);
    let finalPlayerChoice = playerChoice;
    if (this.state.objDActive) {
      console.log("Object D activated, showing popup");
      await this.ui.showObjDPopup();
      finalPlayerChoice = GameObject.D;
    }
    const cpuChoice = this.logic.getCpuChoice();
    await new Promise(resolve => setTimeout(resolve, 1200));
    this.ui.showChoices(finalPlayerChoice, cpuChoice);
    const winner = this.logic.determineWinner(finalPlayerChoice, cpuChoice);
    if (winner === "player") {
      this.state.playerScore++;
      console.log(`Player wins! Score: ${this.state.playerScore}`);
      this.logic.checkObjDTrigger();
      const lifeThreshold = this.state.difficulty === "normal" ? 5 : 10;
      if (this.state.winTarget === 0 && this.state.playerScore % lifeThreshold === 0) {
        await this.ui.addLifeWithAnimation();
      }
    } else if (winner === "cpu") {
      this.state.cpuScore++;
      this.state.failCount++;
      if (this.state.winTarget === 0) this.state.playerLives--;
      console.log(`CPU wins! Lives: ${this.state.playerLives}`);
    } else {
      this.state.failCount++;
      console.log("Tie!");
    }
    this.state.playerChoiceHistory.push(finalPlayerChoice);
    if (this.state.playerChoiceHistory.length > 5) this.state.playerChoiceHistory.shift();
    const soundKey = finalPlayerChoice === GameObject.D ? 'objD1' : `sound-${this.state.objectNames[finalPlayerChoice].toLowerCase()}`;
    await this.playEnhancedSound(soundKey);
    setTimeout(() => {
      this.ui.animateVersus(winner);
      if (winner === "player") {
        this.state.sounds.win.currentTime = 0;
        this.state.sounds.win.play();
      } else if (winner === "cpu") {
        this.state.sounds.lose.currentTime = 0;
        this.state.sounds.lose.play();
      } else {
        this.state.sounds.tie.currentTime = 0;
        this.state.sounds.tie.play();
      }
      if (finalPlayerChoice === GameObject.D) {
        this.state.sounds.objD2.currentTime = 0;
        this.state.sounds.objD2.play();
        this.state.objDActive = false;
        console.log("Object D effects applied");
        this.ui.startObjDElectricEffect(); // 这里调用ObjD特效
      } else {
        this.ui.startElectricEffect(finalPlayerChoice, cpuChoice); // 这里调用普通特效
      }
      setTimeout(() => {
        this.ui.updateScore();
        this.checkGameEnd();
        this.state.isRoundActive = false;
      }, 600);
    }, 800);
  }

  endGame(playerWon: boolean) {
    this.state.gameStarted = false;
    this.state.isRoundActive = false;
    this.logic.calculateGamePoints(playerWon);
    this.ui.toggleScreens("endScreen");
    document.getElementById("endMessage")!.textContent = playerWon ? "You Win! Congratulation!" : "You lost! Try again!";
    document.getElementById("endMessage")!.className = playerWon ? "won" : "lost";
    document.getElementById("finalPlayerScore")!.textContent = this.state.playerScore.toString();
    document.getElementById("finalCpuScore")!.textContent = this.state.cpuScore.toString();
    const newGamePoints = document.getElementById("newGamePoints")!;
    if (this.state.winTarget === 0 || playerWon) {
      newGamePoints.textContent = `New Points: +${this.state.newPoints}`;
      newGamePoints.classList.remove("points-gain", "halo-blink");
      newGamePoints.classList.add("points-gain");
      setTimeout(() => newGamePoints.classList.add("halo-blink"), 2000);
    } else {
      newGamePoints.textContent = "";
      newGamePoints.classList.remove("points-gain", "halo-blink");
    }
    const endSound = playerWon ? 'end-win' : 'end-lose';
    this.state.sounds[endSound].currentTime = 0;
    this.state.sounds[endSound].play();
    this.playBgm('end');
  }

  resetGame() {
    this.ui.toggleScreens("startScreen");
    this.state.gameStarted = false;
    this.state.isRoundActive = false;
    this.state.playerScore = 0;
    this.state.cpuScore = 0;
    this.state.failCount = 0;
    this.state.playerLives = 0;
    this.state.newPoints = 0;
    this.state.objDTriggerCount = 0;
    this.state.objDActive = false;
    this.state.lastCheckedWins = 0;
    this.state.playerChoiceHistory = [];
    this.state.winTarget = undefined;
    this.state.difficulty = "normal";
    document.getElementById("startScreen")!.querySelector("h2")!.textContent = "CHOOSE A GAME MODE";
    document.getElementById("goal-mode")!.classList.remove("hidden");
    document.getElementById("winInfinity")!.classList.remove("hidden");
    document.getElementById("goal-options")!.classList.remove("visible");
    document.getElementById("goal-options")!.classList.add("hidden");
    document.querySelector(".difficulty-toggle")!.classList.add("hidden");
    document.getElementById("difficulty-normal")!.classList.remove("selected");
    document.getElementById("difficulty-hard")!.classList.remove("selected");
    document.getElementById("start")!.classList.add("hidden");
    document.querySelectorAll(".goal-option").forEach(btn => btn.classList.remove("selected"));
    this.ui.updateScore();
    this.ui.updateHighScoreDisplay();
    this.ui.updateGamePoints();
    this.ui.initializeLives();
    this.playBgm('opening');
  }

  toggleBgm() {
    this.state.bgmMuted = !this.state.bgmMuted;
    const soundControls = [
      document.getElementById("startSoundControl")!,
      document.getElementById("gameSoundControl")!,
      document.getElementById("endSoundControl")!
    ];
    if (this.state.bgmMuted) {
      this.stopBgm();
      soundControls.forEach(control => control.classList.add("muted"));
      console.log("BGM muted");
    } else {
      soundControls.forEach(control => control.classList.remove("muted"));
      if (!document.getElementById("startScreen")!.classList.contains("hidden")) {
        this.playBgm('opening');
      } else if (!document.getElementById("gameScreen")!.classList.contains("hidden")) {
        this.playBgm('battle');
      } else if (!document.getElementById("endScreen")!.classList.contains("hidden")) {
        this.playBgm('end');
      }
      console.log("BGM unmuted");
    }
  }

  async playEnhancedSound(soundKey: string) {
    const audioElement = this.state.sounds[soundKey];
    const response = await fetch(audioElement.src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.state.audioContext.decodeAudioData(arrayBuffer);
    const source = this.state.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    const gainNode = this.state.audioContext.createGain();
    gainNode.gain.value = 0.8;
    const convolver = this.state.audioContext.createConvolver();
    const impulseResponse = await this.createImpulseResponse();
    convolver.buffer = impulseResponse;
    const biquadFilter = this.state.audioContext.createBiquadFilter();
    biquadFilter.type = "lowshelf";
    biquadFilter.frequency.value = 200;
    biquadFilter.gain.value = 10;
    source.connect(gainNode);
    gainNode.connect(biquadFilter);
    biquadFilter.connect(convolver);
    convolver.connect(this.state.audioContext.destination);
    source.start();
  }

  async createImpulseResponse(): Promise<AudioBuffer> {
    const length = this.state.audioContext.sampleRate * 1;
    const impulse = this.state.audioContext.createBuffer(2, length, this.state.audioContext.sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (this.state.audioContext.sampleRate * 0.5));
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    return impulse;
  }

  checkGameEnd() {
    if (this.state.winTarget === 0) {
      if (this.state.playerLives <= 0) {
        this.endGame(false);
        this.logic.checkHighScore();
      }
    } else if (this.state.playerScore >= this.state.winTarget!) {
      this.endGame(true);
    } else if (this.state.cpuScore >= this.state.winTarget!) {
      this.endGame(false);
    }
  }
}

export const eventHandler = new EventHandler(gameState, gameLogic, uiManager);