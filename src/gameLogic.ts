// src/gameLogic.ts
import { GameState, gameState } from './state';
import { GameObject } from './types';

export class GameLogic {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  getCpuChoice(): GameObject {
    const choices = [GameObject.A, GameObject.B, GameObject.C];
    return choices[Math.floor(Math.random() * 3)];
  }

  determineWinner(player: GameObject, cpu: GameObject): "player" | "cpu" | "tie" {
    if (player === GameObject.D) return "player";
    if (player === cpu) return "tie";
    if (player === GameObject.A && cpu === GameObject.B) return "player";
    if (player === GameObject.B && cpu === GameObject.C) return "player";
    if (player === GameObject.C && cpu === GameObject.A) return "player";
    if (cpu === GameObject.A && player === GameObject.B) return "cpu";
    if (cpu === GameObject.B && player === GameObject.C) return "cpu";
    if (cpu === GameObject.C && player === GameObject.A) return "cpu";
    return "tie";
  }

  checkObjDTrigger(): void {
    if (this.state.winTarget !== 0) return;
    const wins = this.state.playerScore;
    console.log(`Checking Object D: wins=${wins}, lastCheckedWins=${this.state.lastCheckedWins}, objDTriggerCount=${this.state.objDTriggerCount}`);
    let targetCount = 0;
    if (wins >= 50) targetCount = 5;
    else if (wins >= 35) targetCount = Math.floor(Math.random() * 2) + 2;
    else if (wins >= 15) targetCount = Math.floor(Math.random() * 2) + 1;
    else if (wins >= 5) targetCount = 1;
    const currentMilestone = Math.floor(wins / 5) * 5;
    const lastMilestone = Math.floor(this.state.lastCheckedWins / 5) * 5;
    if (wins > 0 && currentMilestone > lastMilestone && this.state.objDTriggerCount < targetCount) {
      this.state.objDActive = true;
      this.state.objDTriggerCount++;
      console.log(`Object D marked for next round! Milestone: ${currentMilestone}, Target Count: ${targetCount}`);
    } else {
      console.log(`Object D not triggered. Conditions: wins=${wins}, milestone=${currentMilestone}, lastMilestone=${lastMilestone}, triggerCount=${this.state.objDTriggerCount}, targetCount=${targetCount}`);
    }
    this.state.lastCheckedWins = wins;
  }

  checkHighScore() {
    if (this.state.winTarget === 0 && this.state.playerScore > this.state.highScore) {
      this.state.highScore = this.state.playerScore;
      this.state.saveHighScore();
      alert("You set a new record!");
    }
  }

  checkGameEnd() {
    if (this.state.winTarget === 0) {
      if (this.state.playerLives <= 0) {
        // 需要调用endGame，留给eventHandler处理
      }
    } else if (this.state.playerScore >= this.state.winTarget!) {
      // 需要调用endGame
    } else if (this.state.cpuScore >= this.state.winTarget!) {
      // 需要调用endGame
    }
  }

  calculateGamePoints(playerWon: boolean) {
    let basePoints = 0;
    if (this.state.winTarget === 0) {
      const bonus = Math.floor(this.state.playerScore / 10) * 5;
      basePoints = 20 + this.state.playerScore + bonus;
    } else if (playerWon) {
      switch (this.state.winTarget) {
        case 3: basePoints = 5; break;
        case 5: basePoints = 10; break;
        case 7: basePoints = 15; break;
        case 10: basePoints = 20; break;
      }
    }
    this.state.newPoints = this.state.difficulty === "hard" ? basePoints * 2 : basePoints;
    this.state.gamePoints += this.state.newPoints;
    this.state.saveGamePoints();
  }
}

export const gameLogic = new GameLogic(gameState);