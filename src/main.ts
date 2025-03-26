/*
 * PokéFan Battle Game
 * Copyright © 2025 [HAO LI / HAO317]
 * Licensed under the MIT License (or All Rights Reserved)
 * v1.0
 */


// import { gameState } from './state';
// import { gameLogic } from './gameLogic';
import { uiManager } from './uiManager';
import { eventHandler } from './eventHandler';

window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing game");
    uiManager.initializeLives();
    eventHandler.setupEvents();
  });