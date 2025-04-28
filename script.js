// BotRun Game Script

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("BotRun script loaded.");

    // Get DOM elements
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('startButton');
    const playAgainButton = document.getElementById('playAgainButton');
    const playerNameInput = document.getElementById('playerName');
    const finalScoreDisplay = document.getElementById('finalScore');
    const highScoresList = document.getElementById('highScoresList');
    const scoreDisplay = document.getElementById('score-display');
    const currentScoreDisplay = document.getElementById('currentScore');
    const clearScoresButton = document.getElementById('clearScoresButton');

    // Game variables
    let gameSpeed = 3; // Start a bit slower
    let score = 0;
    let player = null;
    let obstacles = [];
    let backgroundElements = [];
    let animationFrameId = null; // To store the requestAnimationFrame ID
    let spawnTimer = 0;
    let playerName = '';
    let highScores = [];
    let isGameOver = false;
    let gameStartTime = 0; // To track game duration for background changes
    let currentBackgroundColor = '#87CEEB'; // Initial Sky Blue
    let timeToNextSpawn = 100; // Initial time before first spawn (frames)
    let lastTime = 0; // For delta time calculation
    let scoreUpdateTimer = 0; // Separate timer for score updates
    let stars = []; // Array for stars
    const STAR_COUNT = 150; // Increased star count slightly
    const GAME_OVER_BG_COLOR = '#2c3e50'; // Dark background for game over
    let timeSinceLastSpeedIncrease = 0; // Added: Timer for time-based speed increase

    // Constants
    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;
    const GROUND_HEIGHT = 50; // Height of the ground area
    const PLAYER_WIDTH = 40;
    const PLAYER_HEIGHT = 50;
    const PLAYER_X = 50; // Fixed X position for the player
    const GRAVITY = 0.6;
    const JUMP_STRENGTH = -13; // Increased jump strength slightly
    const CLOUD_COUNT = 5;
    const OBSTACLE_MIN_WIDTH = 20;
    const OBSTACLE_MAX_WIDTH = 50;
    const OBSTACLE_MIN_HEIGHT = 30;
    const OBSTACLE_MAX_HEIGHT = 70;
    const OBSTACLE_COLOR = '#e74c3c'; // Red color for obstacles
    const MIN_SPAWN_INTERVAL = 75; // Min frames between spawns
    const MAX_SPAWN_INTERVAL = 150; // Max frames between spawns
    const SCORE_INCREMENT_INTERVAL = 10; // Update score every 10 frames approx
    const SPEED_INCREASE_INTERVAL = 300; // Increase speed every 300 points
    const SPEED_INCREASE_AMOUNT = 0.5;
    const MAX_GAME_SPEED = 10;
    const HIGH_SCORE_KEY = 'botRunHighScores'; // localStorage key
    const STAR_VISIBILITY_THRESHOLD = 0.3; // Added: How dark bg needs to be for stars (0 to 1)
    const TIME_SPEED_INCREASE_INTERVAL = 15 * (1000 / 60); // Added: Increase speed every 15s (in frames)
    const TIME_SPEED_INCREASE_AMOUNT = 0.2; // Added: Speed increase amount per interval

    // --- Obstacle Class ---
    class Obstacle {
        constructor() {
            this.width = Math.random() * (OBSTACLE_MAX_WIDTH - OBSTACLE_MIN_WIDTH) + OBSTACLE_MIN_WIDTH;
            this.height = Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT) + OBSTACLE_MIN_HEIGHT;
            this.x = CANVAS_WIDTH; // Start off-screen right
            this.y = CANVAS_HEIGHT - this.height - GROUND_HEIGHT; // On the ground
        }

        update(currentGameSpeed) {
            this.x -= currentGameSpeed;
        }

        draw() {
            ctx.fillStyle = OBSTACLE_COLOR;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // Method to get bounding box for collisions
        getBounds() {
            return {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            };
        }
    }

    // --- Background Element Classes ---
    class Cloud {
        constructor(x, y, size, speed) {
            this.x = x;
            this.y = y;
            this.size = size; // Radius of the main circle
            this.speed = speed;
        }

        update(currentGameSpeed) {
            this.x -= this.speed * currentGameSpeed;
            // Wrap around logic
            if (this.x + this.size * 2 < 0) { // Reset when fully off-screen left
                this.x = CANVAS_WIDTH + Math.random() * 200; // Reappear on the right
                this.y = Math.random() * (CANVAS_HEIGHT / 3); // Randomize height slightly
                this.size = Math.random() * 20 + 15; // Randomize size slightly
            }
        }

        draw() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white
            ctx.beginPath();
            // Simple cloud shape using arcs
            ctx.arc(this.x, this.y, this.size, Math.PI * 0.5, Math.PI * 1.5);
            ctx.arc(this.x + this.size * 0.7, this.y - this.size * 0.5, this.size * 0.8, Math.PI * 1, Math.PI * 2);
            ctx.arc(this.x + this.size * 1.8, this.y, this.size * 0.9, Math.PI * 1.5, Math.PI * 0.5);
            ctx.closePath();
            ctx.fill();
        }
    }

    // --- Player Class ---
    class Player {
        constructor() {
            this.width = PLAYER_WIDTH;
            this.height = PLAYER_HEIGHT;
            this.x = PLAYER_X;
            this.y = CANVAS_HEIGHT - this.height - GROUND_HEIGHT;
            this.velocityY = 0;
            this.isGrounded = true;
            this.jumpScale = 1; // For visual jump effect
            this.isJumpingVisual = false;
        }

        draw() {
            ctx.save(); // Save context state
            // Apply jump scaling effect
            const scaleX = this.isJumpingVisual ? 0.9 : 1;
            const scaleY = this.isJumpingVisual ? 1.1 : 1;
            // Translate to center for scaling
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(scaleX, scaleY);
            // Translate back
            ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

            // Body (Rounded Rectangle)
            ctx.fillStyle = '#3498db'; // Blue color
            const cornerRadius = 10;
            ctx.beginPath();
            // Recalculate path relative to origin after translate/scale for simplicity if needed
            // Or just draw normally, the transform handles it
            ctx.moveTo(this.x + cornerRadius, this.y);
            ctx.lineTo(this.x + this.width - cornerRadius, this.y);
            ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + cornerRadius);
            ctx.lineTo(this.x + this.width, this.y + this.height - cornerRadius);
            ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - cornerRadius, this.y + this.height);
            ctx.lineTo(this.x + cornerRadius, this.y + this.height);
            ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - cornerRadius);
            ctx.lineTo(this.x, this.y + cornerRadius);
            ctx.quadraticCurveTo(this.x, this.y, this.x + cornerRadius, this.y);
            ctx.closePath();
            ctx.fill();

            // Eyes (draw relative to player x,y as transform handles position)
            const eyeRadius = 5;
            const eyeOffsetX = 12;
            const eyeOffsetY = 15;
            const pupilRadius = 2;
            ctx.fillStyle = 'white'; // Left eye white
            ctx.beginPath();
            ctx.arc(this.x + eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black'; // Left eye pupil
            ctx.beginPath();
            ctx.arc(this.x + eyeOffsetX, this.y + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white'; // Right eye white
            ctx.beginPath();
            ctx.arc(this.x + this.width - eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black'; // Right eye pupil
            ctx.beginPath();
            ctx.arc(this.x + this.width - eyeOffsetX, this.y + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore(); // Restore context state
        }

        update(deltaTime) {
            // Apply gravity
            this.velocityY += GRAVITY * deltaTime;
            this.y += this.velocityY * deltaTime;

            // Ground collision
            const groundLevel = CANVAS_HEIGHT - this.height - GROUND_HEIGHT;
            if (this.y > groundLevel) {
                this.y = groundLevel;
                this.velocityY = 0;
                this.isGrounded = true;
                this.isJumpingVisual = false; // Reset visual effect on landing
            } else {
                this.isGrounded = false;
            }

            // Update jump visual state (simple: on if moving up)
             if (this.velocityY < 0) {
                this.isJumpingVisual = true;
            } else if (this.isGrounded) {
                 this.isJumpingVisual = false;
             }
        }

        jump() {
            if (this.isGrounded) {
                this.velocityY = JUMP_STRENGTH;
                this.isGrounded = false;
                this.isJumpingVisual = true; // Start visual effect immediately
            }
        }
        getBounds() {
             // Adjust bounds slightly if using scaling, or keep simple AABB
             // For simplicity, we keep the AABB bounds based on original width/height
            return {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            };
        }
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', startGame);
    clearScoresButton.addEventListener('click', clearHighScores);

    // Jump listeners
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isGameOver && player) {
            player.jump();
        }
    });
    canvas.addEventListener('mousedown', () => {
         if (!isGameOver && player) {
            player.jump();
        }
    });
     canvas.addEventListener('touchstart', (e) => {
         e.preventDefault(); // Prevent screen scrolling
         if (!isGameOver && player) {
            player.jump();
        }
    });

    // Added: Global listener for spacebar on game over
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && isGameOver) {
            startGame();
        }
    });

    // --- Game Functions ---

    function createInitialBackground() {
        backgroundElements = [];
        for (let i = 0; i < CLOUD_COUNT; i++) {
            const size = Math.random() * 20 + 15; // Random size (15-35)
            const x = Math.random() * CANVAS_WIDTH;
            const y = Math.random() * (CANVAS_HEIGHT / 3); // Clouds in upper third
            const speed = Math.random() * 0.3 + 0.1; // Slower than game speed
            backgroundElements.push(new Cloud(x, y, size, speed));
        }
    }

    function updateBackgroundColor() {
        const elapsedTime = (Date.now() - gameStartTime) / 1000; // Time in seconds
        // Simple transition from blue to a slightly darker/purplish hue over 60 seconds
        const transitionDuration = 60; 
        const progress = Math.min(elapsedTime / transitionDuration, 1);

        const startColor = { r: 135, g: 206, b: 235 }; // Sky Blue (#87CEEB)
        const endColor = { r: 72, g: 61, b: 139 }; // Dark Slate Blue (#483D8B)

        const r = Math.round(startColor.r + (endColor.r - startColor.r) * progress);
        const g = Math.round(startColor.g + (endColor.g - startColor.g) * progress);
        const b = Math.round(startColor.b + (endColor.b - startColor.b) * progress);

        currentBackgroundColor = `rgb(${r}, ${g}, ${b})`;
    }

    function startGame() {
        console.log("Starting game...");
        playerName = playerNameInput.value.trim() || 'Anon';
        if (!playerName) {
             playerName = 'Anon';
        }

        // Reset game state
        isGameOver = false;
        score = 0;
        gameSpeed = 3; // Reset speed
        obstacles = [];
        spawnTimer = 0; // Reset obstacle spawn timer
        timeToNextSpawn = MAX_SPAWN_INTERVAL; // Start with max interval
        scoreUpdateTimer = 0; // Reset score timer
        timeSinceLastSpeedIncrease = 0; // Reset time speed timer
        currentScoreDisplay.textContent = score;
        player = new Player(); // Create the player instance
        createInitialBackground(); // Initialize clouds
        createStars(); // Create stars at the beginning
        gameStartTime = Date.now(); // Record start time
        currentBackgroundColor = '#87CEEB'; // Reset background color
        lastTime = 0; // Reset lastTime for delta time calculation

        // Hide screens, show canvas/score
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        canvas.style.display = 'block';
        scoreDisplay.style.display = 'block';

        // Cancel previous animation frame if any
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        // Start the game loop using timestamp
        requestAnimationFrame(gameLoop);
    }

    function gameLoop(currentTime) {
        animationFrameId = requestAnimationFrame(gameLoop);

        if (lastTime === 0) {
            lastTime = currentTime;
            return;
        }
        const deltaTime = (currentTime - lastTime) / (1000 / 60);
        lastTime = currentTime;

        // --- Drawing --- (Clear canvas first)
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (isGameOver) {
            // Draw Game Over background and stars (stars already created)
            ctx.fillStyle = GAME_OVER_BG_COLOR;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            stars.forEach(star => star.draw(1.0)); // Draw game over stars at full opacity
        } else {
            // --- Normal Game Drawing ---
            updateBackgroundColor(); // Calculate current background color
            const elapsedTime = (Date.now() - gameStartTime) / 1000;
            const transitionDuration = 60;
            const progress = Math.min(elapsedTime / transitionDuration, 1); // Calculate darkness progress (0 to 1)

            // Draw Background
            ctx.fillStyle = currentBackgroundColor;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw Stars if background is dark enough
            if (progress > STAR_VISIBILITY_THRESHOLD) {
                 // Fade stars in based on progress past the threshold
                const starOpacityMultiplier = (progress - STAR_VISIBILITY_THRESHOLD) / (1 - STAR_VISIBILITY_THRESHOLD);
                stars.forEach(star => star.draw(starOpacityMultiplier));
            }

            // Draw Ground
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

            // Draw Background Elements (Clouds)
            backgroundElements.forEach(element => {
                element.update(gameSpeed * 0.5 * deltaTime); // Apply deltaTime
                element.draw();
            });

            // Update and Draw Player
            player.update(deltaTime);
            player.draw();

            // Update, Draw, and Manage Obstacles
            handleSpawning(deltaTime);
            obstacles.forEach(obstacle => {
                obstacle.update(gameSpeed * deltaTime);
                obstacle.draw();
            });
            obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

            // Check for Collisions
            handleCollisions(); // This might set isGameOver

            // Update Score and Speed
            updateScoreAndSpeed(deltaTime);
            // --- End Normal Game Drawing ---
        }

        // --- Time-based speed increase ---
        timeSinceLastSpeedIncrease += deltaTime;
        if (timeSinceLastSpeedIncrease >= TIME_SPEED_INCREASE_INTERVAL) {
            if (gameSpeed < MAX_GAME_SPEED) {
                gameSpeed = Math.min(gameSpeed + TIME_SPEED_INCREASE_AMOUNT, MAX_GAME_SPEED);
                console.log("Speed increased (time) to:", gameSpeed);
            }
            timeSinceLastSpeedIncrease = 0; // Reset timer
        }
    }

    function showGameOver() {
        console.log("Game Over!");
        isGameOver = true;
        // Stop further game logic updates by not calling them when isGameOver is true
        // The animation frame continues for the game over screen drawing

        updateHighScores(playerName, score);
        updateHighScoresDisplay(); // Update display on game over screen

        createStars(); // Create stars for the game over screen

        // Display game over screen elements (HTML)
        finalScoreDisplay.textContent = Math.floor(score); // Show final score
        // canvas.style.display = 'none'; // Keep canvas visible for stars
        scoreDisplay.style.display = 'none'; // Hide in-game score
        gameOverScreen.style.display = 'block'; // Show HTML game over info

    }

    // --- Helper Functions (stubs for now) ---

    function handleCollisions() {
        const playerBounds = player.getBounds();
        for (const obstacle of obstacles) {
            const obstacleBounds = obstacle.getBounds();

            // Simple AABB collision check
            if (
                playerBounds.x < obstacleBounds.x + obstacleBounds.width &&
                playerBounds.x + playerBounds.width > obstacleBounds.x &&
                playerBounds.y < obstacleBounds.y + obstacleBounds.height &&
                playerBounds.y + playerBounds.height > obstacleBounds.y
            ) {
                // Collision detected!
                showGameOver();
                return; // Exit loop once collision occurs
            }
        }
    }

    function updateScoreAndSpeed(deltaTime) {
        scoreUpdateTimer += deltaTime;

        if (scoreUpdateTimer >= SCORE_INCREMENT_INTERVAL) {
            score += 1; // Increment score (adjust scoring logic as needed)
            currentScoreDisplay.textContent = Math.floor(score);
            scoreUpdateTimer = 0; // Reset timer

            // Check if speed should increase
            if (Math.floor(score) % SPEED_INCREASE_INTERVAL === 0 && score > 0) {
                if (gameSpeed < MAX_GAME_SPEED) {
                    gameSpeed += SPEED_INCREASE_AMOUNT;
                    console.log("Speed increased to:", gameSpeed);
                     // Optionally adjust spawn rates slightly based on speed
                     // MIN_SPAWN_INTERVAL *= 0.98;
                     // MAX_SPAWN_INTERVAL *= 0.98;
                }
            }
        }
    }

    function handleSpawning(deltaTime) {
        spawnTimer += deltaTime; // Increment timer by delta frames

        if (spawnTimer >= timeToNextSpawn) {
            obstacles.push(new Obstacle());
            spawnTimer = 0; // Reset timer
            // Calculate next spawn time (random interval based on constants)
            timeToNextSpawn = Math.random() * (MAX_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) + MIN_SPAWN_INTERVAL;
        }
    }

    function loadHighScores() {
        console.log("Loading high scores...");
        const storedScores = localStorage.getItem(HIGH_SCORE_KEY);
        if (storedScores) {
            try {
                 highScores = JSON.parse(storedScores);
                 // Ensure it's an array and scores are numbers
                 if (!Array.isArray(highScores)) highScores = [];
                 highScores = highScores.filter(entry => typeof entry.name === 'string' && typeof entry.score === 'number');
            } catch (e) {
                console.error("Error parsing high scores from localStorage:", e);
                highScores = [];
            }
        } else {
            highScores = [];
        }
         // Ensure it's sorted initially, just in case
        highScores.sort((a, b) => b.score - a.score);
        console.log("Loaded scores:", highScores);
        // Display scores on startup (optional, usually shown on game over)
        // updateHighScoresDisplay();
    }

    function updateHighScores(name, newScore) {
        const finalScore = Math.floor(newScore);
        console.log(`Attempting to update high scores with ${name}: ${finalScore}`);

        // Add the new score
        highScores.push({ name: name, score: finalScore });

        // Sort by score descending
        highScores.sort((a, b) => b.score - a.score);

        // Keep only top 3
        highScores = highScores.slice(0, 3);

        // Save back to localStorage
        try {
            localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(highScores));
            console.log("High scores saved:", highScores);
        } catch (e) {
            console.error("Error saving high scores to localStorage:", e);
        }
        // The display update is now called in showGameOver after this function runs.
    }

    function updateHighScoresDisplay() {
        console.log("Updating high scores display...");
        highScoresList.innerHTML = ''; // Clear previous list items

        for (let i = 0; i < 3; i++) {
            const li = document.createElement('li');
            if (highScores[i]) {
                // Sanitize name display (basic example)
                const displayName = highScores[i].name.substring(0, 10); // Max 10 chars
                li.textContent = `${displayName}: ${highScores[i].score}`;
            } else {
                li.textContent = '--- : 0'; // Placeholder for empty slots
            }
            highScoresList.appendChild(li);
        }
         console.log("High score display updated.");
    }

    function clearHighScores() {
        console.log("Clearing high scores...");
        highScores = []; // Clear the array in memory
        try {
            localStorage.removeItem(HIGH_SCORE_KEY); // Remove from localStorage
            console.log("High scores cleared from localStorage.");
        } catch (e) {
            console.error("Error clearing high scores from localStorage:", e);
        }
        updateHighScoresDisplay(); // Update the displayed list
    }

    // Added: Simple Star class
    class Star {
        constructor() {
            this.x = Math.random() * CANVAS_WIDTH;
            this.y = Math.random() * CANVAS_HEIGHT;
            this.size = Math.random() * 1.5 + 0.5; // Slightly smaller stars
            this.baseOpacity = Math.random() * 0.5 + 0.3; // Base random opacity
        }

        // Added multiplier parameter
        draw(opacityMultiplier = 1.0) {
            const finalOpacity = this.baseOpacity * opacityMultiplier;
            if (finalOpacity <= 0) return; // Don't draw if invisible

            ctx.fillStyle = `rgba(255, 255, 224, ${finalOpacity})`; // Light yellow, semi-transparent
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push(new Star());
        }
    }

    // Initial setup on load
    loadHighScores(); // Load scores when the page loads
    updateHighScoresDisplay(); // Also display them on the game over screen initially

}); 