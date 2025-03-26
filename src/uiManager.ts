
import { GameState, gameState } from './state';
import { GameObject } from './types';

export class UIManager {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  showExitModal(): void {
    const exitModal = document.querySelector('#exitModal') as HTMLDivElement;
    if (exitModal) {
      exitModal.classList.remove('hidden');
    }
  }

  hideExitModal(): void {
    const exitModal = document.querySelector('#exitModal') as HTMLDivElement;
    if (exitModal) {
      exitModal.classList.add('hidden');
    }
  }

  exitGame(): void {
    this.hideExitModal();
    this.toggleScreens('startScreen');
  }

  async addLifeWithAnimation() {
    if (this.state.winTarget !== 0) return;
    this.state.playerLives++;
    this.updatePlayerLives();
    const playerLifeContainer = document.getElementById("playerlife")!;
    const newBall = playerLifeContainer.lastElementChild as HTMLElement;
    if (newBall) {
      newBall.classList.add("life-gain");
      const wrapper = document.createElement("div"); // 创建包裹元素
      wrapper.classList.add("life-wrapper");
      newBall.parentNode?.insertBefore(wrapper, newBall); // 将wrapper插入newBall位置
      wrapper.appendChild(newBall); // 将newBall移入wrapper
      const plusOne = document.createElement("div");
      plusOne.classList.add("plus-one");
      plusOne.textContent = "+1";
      wrapper.appendChild(plusOne); // +1放入wrapper
      this.state.sounds["life-up"].currentTime = 0;
      this.state.sounds["life-up"].play();
      await new Promise(resolve => setTimeout(resolve, 1500));
      newBall.classList.remove("life-gain");
      wrapper.replaceWith(newBall); // 动画结束，解包只保留newBall
    }
  }

  async showObjDPopup(): Promise<void> {
    const gameScreen = document.getElementById("gameScreen2");
    if (!gameScreen) {
      console.error("gameScreen2 not found!");
      return;
    }
    const popup = document.createElement("div");
    popup.id = "objD-popup";
    popup.style.backgroundImage = `url('/PokeFanBattle/Assets/Img/img_objD_big.png')`;
    gameScreen.appendChild(popup);
    console.log("Popup appended to gameScreen2");
    try {
      this.state.sounds.objD1.currentTime = 0;
      await this.state.sounds.objD1.play();
      console.log("Object D sound played successfully");
    } catch (error) {
      console.error("Failed to play Object D sound:", error);
    }
    await new Promise(resolve => setTimeout(resolve, 1100));
    popup.classList.add("shrink");
    console.log("Shrink animation started");
    await new Promise(resolve => setTimeout(resolve, 500));
    popup.remove();
    console.log("Object D popup removed");
  }

  showChoices(playerChoice: GameObject, cpuChoice: GameObject) {
    const playerVersus = document.getElementById("playerVersus")!;
    const cpuVersus = document.getElementById("cpuVersus")!;
    console.log(`Showing choices: Player=${this.state.objectNames[playerChoice]}, CPU=${this.state.objectNames[cpuChoice]}`);
    console.log(`Player image URL: ${this.state.playerImages[playerChoice]}`);
    console.log(`CPU image URL: ${this.state.cpuImages[cpuChoice]}`);
    playerVersus.style.backgroundImage = `url('${this.state.playerImages[playerChoice]}')`;
    cpuVersus.style.backgroundImage = `url('${this.state.cpuImages[cpuChoice]}')`;
    playerVersus.className = "choice-display choice-appear";
    cpuVersus.className = "choice-display choice-appear";
    const playerButtons = ["objA", "objB", "objC"];
    const cpuButtons = ["objA-cpu", "objB-cpu", "objC-cpu"];
    playerButtons.forEach((id, index) => {
      const btn = document.getElementById(id)!;
      btn.style.opacity = index === (playerChoice === GameObject.D ? -1 : playerChoice) ? "1" : "0.5";
    });
    cpuButtons.forEach((id, index) => {
      const btn = document.getElementById(id)!;
      btn.style.opacity = (2 - index) === cpuChoice ? "1" : "0.5";
    });
  }

  startObjDElectricEffect() {
    if (this.state.animationFrameId) cancelAnimationFrame(this.state.animationFrameId);
    const particles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    const particleCount = 95;
    const maxLife = 60;
    const animate = () => {
      this.state.playerCtx.clearRect(0, 0, 300, 300);
      this.state.cpuCtx.clearRect(0, 0, 300, 300);
      if (particles.length < particleCount) {
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (Math.random() * 3 + 1) * 4;
          particles.push({ x: 150, y: 150, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: maxLife });
        }
      }
      particles.forEach((p, index) => {
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.x < 0 || p.x > 300) p.vx *= -1;
        if (p.y < 0 || p.y > 300) p.vy *= -1;
        const dx = p.x - 150; const dy = p.y - 150;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 200) {
          const angle = Math.atan2(dy, dx);
          p.x = 150 + Math.cos(angle) * 200;
          p.y = 150 + Math.sin(angle) * 200;
          p.vx *= -0.5; p.vy *= -0.5;
        }
        this.state.playerCtx.beginPath();
        this.state.playerCtx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        this.state.playerCtx.fillStyle = `rgba(255, 255, 0, ${p.life / maxLife})`;
        this.state.playerCtx.fill();
        if (Math.random() < 0.1) {
          const target = particles[Math.floor(Math.random() * particles.length)];
          this.state.playerCtx.beginPath();
          this.state.playerCtx.moveTo(p.x, p.y);
          this.state.playerCtx.lineTo(target.x, target.y);
          this.state.playerCtx.strokeStyle = `rgba(255, 215, 0, ${p.life / maxLife * 0.7})`;
          this.state.playerCtx.lineWidth = 1;
          this.state.playerCtx.stroke();
        }
        if (p.life <= 0) particles.splice(index, 1);
      });
      if (particles.length > 0) {
        this.state.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.state.playerCtx.clearRect(0, 0, 300, 300);
        this.state.animationFrameId = null;
      }
    };
    this.state.animationFrameId = requestAnimationFrame(animate);
  }

  startElectricEffect(playerChoice: GameObject, cpuChoice: GameObject) {
    console.log("Starting electric effect for:", playerChoice, cpuChoice); // 检查是否调用
    if (this.state.animationFrameId) cancelAnimationFrame(this.state.animationFrameId);
    const circles: { radius: number; opacity: number }[] = [];
    const maxRadius = 150;
    const getColor = (choice: GameObject) => {
      switch (choice) {
        case GameObject.A: return { r: 255, g: 0, b: 0 };
        case GameObject.B: return { r: 0, g: 255, b: 0 };
        case GameObject.C: return { r: 135, g: 206, b: 235 };
        default: return { r: 0, g: 255, b: 255 };
      }
    };
    const playerColor = getColor(playerChoice);
    const cpuColor = getColor(cpuChoice);
    const animate = () => {
      this.state.playerCtx.clearRect(0, 0, 300, 300);
      this.state.cpuCtx.clearRect(0, 0, 300, 300);
      if (circles.length < 3 && Math.random() < 0.1) {
        circles.push({ radius: 0, opacity: 1 });
      }
      circles.forEach((circle, index) => {
        circle.radius += 2;
        circle.opacity = 1 - circle.radius / maxRadius;
        this.drawSegmentedCircle(this.state.playerCtx, 150, 150, circle.radius, circle.opacity, playerColor);
        this.drawSegmentedCircle(this.state.cpuCtx, 150, 150, circle.radius, circle.opacity, cpuColor);
        this.drawElectricSparks(this.state.playerCtx, 150, 150, circle.radius, circle.opacity, playerColor);
        this.drawElectricSparks(this.state.cpuCtx, 150, 150, circle.radius, circle.opacity, cpuColor);
        if (circle.radius >= maxRadius) circles.splice(index, 1);
      });
      if (circles.length > 0) {
        this.state.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.state.playerCtx.clearRect(0, 0, 300, 300);
        this.state.cpuCtx.clearRect(0, 0, 300, 300);
        this.state.animationFrameId = null;
      }
    };
    circles.push({ radius: 0, opacity: 1 });
    this.state.animationFrameId = requestAnimationFrame(animate);
  }

  drawSegmentedCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, opacity: number, color: { r: number; g: number; b: number }) {
    const segments = 12;
    const segmentAngle = (Math.PI * 2) / segments;
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < segments; i++) {
      const startAngle = i * segmentAngle + (Math.random() - 0.5) * 0.2;
      const endAngle = startAngle + segmentAngle * (0.7 + Math.random() * 0.3);
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle);
      ctx.stroke();
    }
  }

  drawElectricSparks(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, opacity: number, color: { r: number; g: number; b: number }) {
    const sparkCount = 8;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const sparkLength = radius + Math.random() * 20;
      const deviation = (Math.random() - 0.5) * 10;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      ctx.lineTo(x + Math.cos(angle) * sparkLength + deviation, y + Math.sin(angle) * sparkLength + deviation);
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  animateVersus(winner: "player" | "cpu" | "tie") {
    const playerVersus = document.getElementById("playerVersus")!;
    const cpuVersus = document.getElementById("cpuVersus")!;
    playerVersus.classList.remove("choice-appear", "strong", "weak");
    cpuVersus.classList.remove("choice-appear", "strong", "weak");
    if (winner === "player") {
      playerVersus.classList.add("strong");
      cpuVersus.classList.add("weak");
    } else if (winner === "cpu") {
      playerVersus.classList.add("weak");
      cpuVersus.classList.add("strong");
    }
  }

  updateScore() {
    document.getElementById("playerScore")!.textContent = this.state.playerScore.toString();
    document.getElementById("cpuScore")!.textContent = this.state.cpuScore.toString();
    if (this.state.winTarget === 0) this.updatePlayerLives();
  }

  updateHighScoreDisplay() {
    document.getElementById("highScore")!.textContent = this.state.highScore.toString();
  }

  updateGamePoints() {
    document.getElementById("gamePoints")!.textContent = this.state.gamePoints.toString();
  }

  initializeLives() {
    const playerLifeContainer = document.getElementById("playerlife")!;
    const cpuLifeContainer = document.getElementById("cpulife")!;
    playerLifeContainer.innerHTML = "";
    cpuLifeContainer.innerHTML = "";
    if (this.state.winTarget === 0) {
      for (let i = 0; i < this.state.playerLives; i++) {
        const ball = document.createElement("div");
        ball.classList.add("ball-small");
        playerLifeContainer.appendChild(ball);
      }
      for (let i = 0; i < 9; i++) {
        const ball = document.createElement("div");
        ball.classList.add("ball-small", "blink");
        cpuLifeContainer.appendChild(ball);
      }
      cpuLifeContainer.classList.remove("hidden");
    } else {
      cpuLifeContainer.classList.add("hidden");
    }
  }

  updatePlayerLives() {
    const playerLifeContainer = document.getElementById("playerlife")!;
    playerLifeContainer.innerHTML = "";
    if (this.state.winTarget === 0) {
      for (let i = 0; i < this.state.playerLives; i++) {
        const ball = document.createElement("div");
        ball.classList.add("ball-small");
        playerLifeContainer.appendChild(ball);
      }
    }
  }

  toggleScreens(activeScreen: string) {
    if (this.state.animationFrameId) {
      cancelAnimationFrame(this.state.animationFrameId);
      this.state.animationFrameId = null;
      this.state.playerCtx.clearRect(0, 0, 300, 300);
      this.state.cpuCtx.clearRect(0, 0, 300, 300);
    }
    const screens = ["startScreen", "gameScreen", "endScreen"];
    const currentScreen = screens.find(screen => !document.getElementById(screen)!.classList.contains("hidden"));
    if (currentScreen && currentScreen !== activeScreen) {
      const currentElement = document.getElementById(currentScreen)!;
      currentElement.classList.add("fade-out");
      setTimeout(() => {
        currentElement.classList.add("hidden");
        currentElement.classList.remove("fade-out");
        const newElement = document.getElementById(activeScreen)!;
        newElement.classList.remove("hidden");
        newElement.classList.add("fade-in");
        // 强制隐藏退出弹窗
        if (activeScreen === "gameScreen") {
          this.hideExitModal();
        }
        setTimeout(() => newElement.classList.remove("fade-in"), 300);
      }, 500);
    } else {
      const newElement = document.getElementById(activeScreen)!;
      newElement.classList.remove("hidden");
      newElement.classList.add("fade-in");
      // 强制隐藏退出弹窗
      if (activeScreen === "gameScreen") {
        this.hideExitModal();
      }
      setTimeout(() => newElement.classList.remove("fade-in"), 300);
    }
  }

  async playBattleAnimation(nextScreenElement: HTMLElement) {
    const overlay = document.createElement("div");
    overlay.classList.add("transition-overlay");
    document.body.appendChild(overlay);
    const region = document.createElement("div");
    region.classList.add("battle-region");
    overlay.appendChild(region);
    const text = document.createElement("span");
    text.classList.add("battle-text");
    text.textContent = "BATTLE";
    region.appendChild(text);
    await new Promise(resolve => setTimeout(resolve, 1000));
    text.classList.add("burst");
    text.textContent = "START";
    await new Promise(resolve => setTimeout(resolve, 300));
    region.classList.add("fade-out");
    await new Promise(resolve => setTimeout(resolve, 500));
    overlay.remove();
    nextScreenElement.classList.remove("fade-in");
  }


}

export const uiManager = new UIManager(gameState);