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
    let currentScreenState = 'start'; // Added: 'start', 'game', 'gameOver'
    let animatedTitleText = ''; // Added: Text currently displayed by animation
    let titleAnimationTimer = 0; // Added: Timer for title animation
    const TITLE_TYPE_SPEED = 5; // Added: Frames per character
    const TITLE_CURSOR_BLINK_RATE = 30; // Added: Frames for cursor blink cycle
    const TARGET_TITLE = "BotRun"; // Added: The title to animate
    const MAX_GAME_SPEED = 10;
    const HIGH_SCORE_KEY = 'botRunHighScores'; // localStorage key
    const STAR_VISIBILITY_THRESHOLD = 0.6; // Adjusted: Stars appear when it's darker (0 to 1, based on sine wave)
    const TIME_SPEED_INCREASE_INTERVAL = 15 * (1000 / 60); // Increase speed every 15s (in frames)
    const TIME_SPEED_INCREASE_AMOUNT = 0.15; // Slightly reduced base time increase
    const DAY_NIGHT_CYCLE_DURATION = 120; // seconds for a full day-night-day cycle
    const SCORE_SPEED_PHASE_INTERVAL = 500; // Change speed phase every 500 points
    const SPEED_PHASE_MULTIPLIERS = [1.0, 1.2, 1.1]; // Multipliers for Normal, Fast, Faster phases
    let currentSpeedPhase = 0; // Index into SPEED_PHASE_MULTIPLIERS
    const MAX_JUMP_HEIGHT_ESTIMATE = 180; // Approx max pixels player can jump above ground pos
    const INVINCIBILITY_DURATION = 21 * (1000 / 60); // 21 seconds in frames (Tripled)
    const HEART_COLOR = '#e74c3c'; // Red for heart

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
    const WATER_COLOR = '#3498db'; // Blue for water
    const ENEMY_BOT_COLOR = '#e74c3c'; // Red for enemy bot
    const SCORE_INCREMENT_INTERVAL = 10; // Update score every 10 frames approx
    const SPEED_INCREASE_INTERVAL = 300; // Increase speed every 300 points
    const SPEED_INCREASE_AMOUNT = 0.5;
    const SPIKE_COLOR = '#7f8c8d'; // Grey for spikes
    const FLYING_OBSTACLE_COLOR = '#f1c40f'; // Yellow for flying obstacle

    // Difficulty Settings
    const DIFFICULTY_SCORE_INTERVAL = 250;

    // --- Base Obstacle Class ---
    class Obstacle {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.animationTimer = Math.random() * Math.PI * 2; // Random start for animation
        }

        // Base update only handles horizontal movement
        update(currentGameSpeed, deltaTime) {
            this.x -= currentGameSpeed * deltaTime;
            this.animationTimer += 0.1 * deltaTime; // Increment animation timer
        }

        // Base draw method (can be overridden)
        draw() {
            // Default draw (e.g., a placeholder or nothing)
        }

        getBounds() {
            return {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            };
        }
    }

    // --- Water Obstacle Class ---
    class WaterObstacle extends Obstacle {
        constructor() {
            const width = Math.random() * 40 + 50; // Wider, less varied
            const height = Math.random() * 10 + 15; // Lower height
            const x = CANVAS_WIDTH;
            const y = CANVAS_HEIGHT - height - GROUND_HEIGHT; // On the ground
            super(x, y, width, height);
            this.baseHeight = height; // Store original height for animation
            this.rippleAmplitude = 3; // How much the height changes
        }

        update(currentGameSpeed, deltaTime) {
            super.update(currentGameSpeed, deltaTime); // Call base update for movement
            // Animate height for ripple effect
            this.height = this.baseHeight + Math.sin(this.animationTimer) * this.rippleAmplitude;
            this.y = CANVAS_HEIGHT - this.height - GROUND_HEIGHT; // Adjust y based on new height
        }

        draw() {
            ctx.fillStyle = WATER_COLOR;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // --- Enemy Bot Obstacle Class ---
    class EnemyBotObstacle extends Obstacle {
        constructor() {
            const baseSizeFactor = 0.8;
            const sizeVariance = 0.15;
            const randomFactor = baseSizeFactor + (Math.random() * 2 - 1) * sizeVariance;
            const width = PLAYER_WIDTH * randomFactor;
            const height = PLAYER_HEIGHT * randomFactor;
            const x = CANVAS_WIDTH;
            const baseY = CANVAS_HEIGHT - height - GROUND_HEIGHT - 5; // Start slightly above ground
            super(x, baseY, width, height);
            this.baseY = baseY;
            this.bobAmplitude = 5;
        }

        update(currentGameSpeed, deltaTime) {
            super.update(currentGameSpeed, deltaTime); // Call base update for movement
            this.y = this.baseY + Math.sin(this.animationTimer * 1.5) * this.bobAmplitude; // Faster bob
        }

        draw() {
            // Body (red rounded rectangle)
            ctx.fillStyle = ENEMY_BOT_COLOR;
            const cornerRadius = 5;
            ctx.beginPath();
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

            // Big Angry Eyes (Red pupils, angled)
            const eyeRadius = this.width * 0.15;
            const pupilRadius = eyeRadius * 0.5;
            const eyeOffsetX = this.width * 0.25;
            const eyeOffsetY = this.height * 0.35;

            // White part
            ctx.fillStyle = 'white';
            ctx.beginPath(); // Left eye white
            ctx.arc(this.x + eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath(); // Right eye white
            ctx.arc(this.x + this.width - eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();

             // Red pupil (slightly offset up/inward for angry look)
            ctx.fillStyle = 'red';
            ctx.beginPath(); // Left pupil
            ctx.arc(this.x + eyeOffsetX + pupilRadius*0.2, this.y + eyeOffsetY - pupilRadius*0.2, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath(); // Right pupil
            ctx.arc(this.x + this.width - eyeOffsetX - pupilRadius*0.2, this.y + eyeOffsetY - pupilRadius*0.2, pupilRadius, 0, Math.PI * 2);
            ctx.fill();

             // Optional: Simple angled eyebrows
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            const browLength = eyeRadius * 1.5;
            const browAngle = -Math.PI / 6; // Angled down
            // Left brow
            ctx.beginPath();
            ctx.moveTo(this.x + eyeOffsetX - browLength * 0.6, this.y + eyeOffsetY - eyeRadius * 0.8);
            ctx.lineTo(this.x + eyeOffsetX + browLength * 0.4, this.y + eyeOffsetY - eyeRadius * 1.2);
            ctx.stroke();
            // Right brow
            ctx.beginPath();
            ctx.moveTo(this.x + this.width - eyeOffsetX - browLength * 0.4, this.y + eyeOffsetY - eyeRadius * 1.2);
            ctx.lineTo(this.x + this.width - eyeOffsetX + browLength * 0.6, this.y + eyeOffsetY - eyeRadius * 0.8);
            ctx.stroke();
        }
    }

    // --- Spike Obstacle Class ---
    class SpikeObstacle extends Obstacle {
        constructor() {
            const width = Math.random() * 20 + 20; // Relatively narrow
            const height = Math.random() * 20 + 25; // Relatively short
            const x = CANVAS_WIDTH;
            const y = CANVAS_HEIGHT - height - GROUND_HEIGHT; // On the ground
            super(x, y, width, height);
        }

        // No specific animation update needed, uses base class update for movement
        update(currentGameSpeed, deltaTime) {
            super.update(currentGameSpeed, deltaTime);
        }

        draw() {
            ctx.fillStyle = SPIKE_COLOR;
            ctx.beginPath();
            // Simple triangle shape
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        }
    }

    // --- Flying Obstacle Class ---
    class FlyingObstacle extends Obstacle {
        constructor() {
            const size = Math.random() * 15 + 20;
            const x = CANVAS_WIDTH;
            // Position higher up, BUT within jump range
            const playerMaxReach = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT - MAX_JUMP_HEIGHT_ESTIMATE;
            const minY = Math.max(30, playerMaxReach); // Don't go below 30px from top, ensure reachable
            const maxY = CANVAS_HEIGHT - GROUND_HEIGHT - size - 50; // Ensure it's well above ground
            const y = Math.random() * (maxY - minY) + minY; // Random Y within the calculated range
            super(x, y, size, size);
        }

        update(currentGameSpeed, deltaTime) {
            super.update(currentGameSpeed, deltaTime);
        }

        draw() {
            ctx.fillStyle = FLYING_OBSTACLE_COLOR;
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }

    // --- Bouncing Obstacle Class ---
    class BouncingObstacle extends Obstacle {
        constructor() {
            const size = Math.random() * 10 + 20; // Bouncing ball size
            const x = CANVAS_WIDTH;
            const y = CANVAS_HEIGHT / 2; // Start mid-screen vertically
            super(x, y, size, size);
            this.velocityY = (Math.random() - 0.5) * 10; // Initial vertical velocity
            this.radius = size / 2;
            this.bounceGravity = 0.3; // Gravity effect for bouncing
            this.elasticity = 0.7; // How much energy is kept on bounce
            this.bounceCeiling = 30; // Invisible ceiling
        }

        update(currentGameSpeed, deltaTime) {
            // Horizontal movement (from base class)
            super.update(currentGameSpeed, deltaTime);

            // Vertical movement
            this.velocityY += this.bounceGravity * deltaTime;
            this.y += this.velocityY * deltaTime;

            // Ground collision (bottom of ball)
            const groundLevel = CANVAS_HEIGHT - GROUND_HEIGHT - this.radius;
            if (this.y > groundLevel) {
                this.y = groundLevel;
                this.velocityY *= -this.elasticity; // Reverse and dampen velocity
                 // Add slight random horizontal impulse on bounce (optional)
                 // this.x += (Math.random() - 0.5) * 5;
            }

            // Ceiling collision (top of ball)
            if (this.y < this.bounceCeiling + this.radius) {
                this.y = this.bounceCeiling + this.radius;
                this.velocityY *= -this.elasticity; // Reverse and dampen
            }
        }

        draw() {
            ctx.fillStyle = '#e67e22'; // Orange color for bouncing ball
            ctx.beginPath();
            ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Adjust bounds for circle collision (optional, using AABB for simplicity now)
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
            this.isInvincible = false;
            this.invincibilityTimer = 0;
        }

        draw() {
            ctx.save();

             // Glow effect if invincible
            if (this.isInvincible) {
                const blinkRate = 10; // Faster blink for glow
                const alpha = (Math.sin(this.invincibilityTimer * (Math.PI * 2 / blinkRate)) + 1) / 2 * 0.5 + 0.3; // Pulsing alpha 0.3-0.8
                ctx.shadowColor = `rgba(255, 255, 0, ${alpha})`; // Pulsing yellow glow
                ctx.shadowBlur = 20;
            }

            // Apply jump scaling effect
            const scaleX = this.isJumpingVisual ? 0.9 : 1;
            const scaleY = this.isJumpingVisual ? 1.1 : 1;
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(scaleX, scaleY);
            ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

            // Body (Rounded Rectangle)
            ctx.fillStyle = '#3498db';
            const cornerRadius = 10;
            ctx.beginPath();
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

            // Eyes drawing ...
             const eyeRadius = 5;
            const eyeOffsetX = 12;
            const eyeOffsetY = 15;
            const pupilRadius = 2;
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(this.x + eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2); ctx.fill(); // Left white
            ctx.fillStyle = 'black';
            ctx.beginPath(); ctx.arc(this.x + eyeOffsetX, this.y + eyeOffsetY, pupilRadius, 0, Math.PI * 2); ctx.fill(); // Left pupil
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(this.x + this.width - eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2); ctx.fill(); // Right white
            ctx.fillStyle = 'black';
            ctx.beginPath(); ctx.arc(this.x + this.width - eyeOffsetX, this.y + eyeOffsetY, pupilRadius, 0, Math.PI * 2); ctx.fill(); // Right pupil


            ctx.restore(); // Restore context state (removes shadow/scale)
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
                this.isJumpingVisual = false;
            } else {
                this.isGrounded = false;
            }

             // Update jump visual state
             if (this.velocityY < 0) {
                this.isJumpingVisual = true;
            } else if (this.isGrounded) {
                 this.isJumpingVisual = false;
             }

            // Update invincibility timer
            if (this.isInvincible) { // Check if currently invincible
                this.invincibilityTimer += deltaTime;
                if (this.invincibilityTimer >= INVINCIBILITY_DURATION) {
                    this.isInvincible = false;
                    this.invincibilityTimer = 0;
                    console.log("Invincibility ended");
                }
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

    function setupStartScreen() {
        console.log("Setting up start screen...");
        currentScreenState = 'start';
        isGameOver = false; // Ensure game over flag is reset
        animatedTitleText = ''; // Reset animation
        titleAnimationTimer = 0;

        // Hide game elements, show start screen (title will be on canvas)
        startScreen.style.display = 'block';
        gameOverScreen.style.display = 'none';
        canvas.style.display = 'block'; // Canvas is always visible now
        scoreDisplay.style.display = 'none';

        // Hide the static HTML title
        const h1Title = startScreen.querySelector('h1');
        if(h1Title) h1Title.style.display = 'none';

         // Make sure high scores are visible initially if start screen overlays canvas
        loadHighScores();
        updateHighScoresDisplay(); // Update display for game over part
    }

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

        // Use sine wave for cyclical transition
        const cycleProgress = (elapsedTime % DAY_NIGHT_CYCLE_DURATION) / DAY_NIGHT_CYCLE_DURATION;
        const darkness = (Math.sin(cycleProgress * Math.PI * 2 - Math.PI / 2) + 1) / 2; // 0 (midday) -> 1 (midnight) -> 0 (midday)

        const startColor = { r: 135, g: 206, b: 235 }; // Sky Blue (Day)
        const endColor = { r: 44, g: 62, b: 80 };   // Dark Blue/Grey (Night) (#2c3e50 approx)

        const r = Math.round(startColor.r + (endColor.r - startColor.r) * darkness);
        const g = Math.round(startColor.g + (endColor.g - startColor.g) * darkness);
        const b = Math.round(startColor.b + (endColor.b - startColor.b) * darkness);

        currentBackgroundColor = `rgb(${r}, ${g}, ${b})`;
        return darkness; // Return darkness level (0 to 1)
    }

    function startGame() {
        console.log("Starting game...");
        playerName = playerNameInput.value.trim() || 'Anon';
        if (!playerName) {
             playerName = 'Anon';
        }

        // Reset game state
        currentScreenState = 'game'; // Set state to game
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

        // Hide screens, show canvas/score (title managed by game loop)
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        canvas.style.display = 'block';
        scoreDisplay.style.display = 'block';

        // Cancel previous animation frame just in case?
        // if (animationFrameId) {
        //     cancelAnimationFrame(animationFrameId);
        // }
        // No need to restart loop, it runs continuously
    }

    // --- Animation and Drawing Functions ---

    function drawAnimatedTitle(titleText, deltaTime) {
        titleAnimationTimer += deltaTime;

        // Typing effect
        const targetLength = titleText.length;
        let currentLength = Math.floor(titleAnimationTimer / TITLE_TYPE_SPEED);
        if (currentLength > targetLength) {
            currentLength = targetLength;
        }
        animatedTitleText = titleText.substring(0, currentLength);

        // Calculate position (centered)
        const fontSize = 60;
        ctx.font = `${fontSize}px 'Courier New', Courier, monospace`;
        ctx.fillStyle = '#0f0'; // Green color for code style
        ctx.textAlign = 'center';
        const textWidth = ctx.measureText(animatedTitleText).width;
        const x = CANVAS_WIDTH / 2;
        const y = CANVAS_HEIGHT / 3; // Position title higher up

         // Glow effect
        ctx.shadowColor = '#0f0';
        ctx.shadowBlur = 15;

        ctx.fillText(animatedTitleText, x, y);

        // Blinking cursor (only if typing not finished)
        if (currentLength < targetLength) {
            const cursorVisible = Math.floor(titleAnimationTimer / TITLE_CURSOR_BLINK_RATE) % 2 === 0;
            if (cursorVisible) {
                ctx.fillText('_', x + textWidth / 2 + 5, y);
            }
        }
         // Reset shadow for other drawings
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    function drawGameOverText() {
        ctx.font = `40px 'Courier New', Courier, monospace`;
        ctx.fillStyle = '#ff0000'; // Red for Game Over
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillText("Game Over!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20); // Position below title
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
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

        let currentFrameSpeed = gameSpeed; // Default speed if not in game

        // --- State-based Drawing and Logic ---
        switch (currentScreenState) {
            case 'start':
                ctx.fillStyle = GAME_OVER_BG_COLOR;
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                drawAnimatedTitle(TARGET_TITLE, deltaTime);
                break;

            case 'gameOver':
                ctx.fillStyle = GAME_OVER_BG_COLOR;
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                stars.forEach(star => star.draw(1.0));
                drawAnimatedTitle(TARGET_TITLE, deltaTime);
                drawGameOverText();
                break;

            case 'game':
                currentFrameSpeed = updateScoreAndSpeed(deltaTime); // Update score and get current effective speed
                const darknessLevel = updateBackgroundColor();
                ctx.fillStyle = currentBackgroundColor;
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                if (darknessLevel > STAR_VISIBILITY_THRESHOLD) {
                    const starOpacityMultiplier = (darknessLevel - STAR_VISIBILITY_THRESHOLD) / (1 - STAR_VISIBILITY_THRESHOLD);
                    stars.forEach(star => star.draw(starOpacityMultiplier));
                }
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
                backgroundElements.forEach(element => {
                    element.update(currentFrameSpeed * 0.5 * deltaTime); // Use currentFrameSpeed
                    element.draw();
                });
                player.update(deltaTime);
                player.draw();
                handleSpawning(deltaTime, score); // Pass score for difficulty
                obstacles.forEach(obstacle => {
                    obstacle.update(currentFrameSpeed, deltaTime); // Use currentFrameSpeed
                    obstacle.draw();
                });
                obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
                handleCollisions();
                break;
        }
    }

    function showGameOver() {
        console.log("Game Over!");
        // isGameOver = true; // No longer just a flag, change the state
        currentScreenState = 'gameOver';
        animatedTitleText = ''; // Reset title animation for game over
        titleAnimationTimer = 0;

        updateHighScores(playerName, score);
        updateHighScoresDisplay(); // Update display on game over screen

        createStars(); // Ensure stars are ready for game over screen

        // Display game over screen HTML elements (except title)
        finalScoreDisplay.textContent = Math.floor(score);
        scoreDisplay.style.display = 'none'; // Hide in-game score
        gameOverScreen.style.display = 'block'; // Show HTML game over info
        startScreen.style.display = 'none'; // Hide start screen elements

        // Hide the static HTML title
        const h2Title = gameOverScreen.querySelector('h2');
        if(h2Title) h2Title.style.display = 'none';
    }

    // --- Helper Functions (stubs for now) ---

    function handleCollisions() {
        if (!player) return;
        const playerBounds = player.getBounds();

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            const obstacleBounds = obstacle.getBounds();

            // Simple AABB collision check
            if (
                playerBounds.x < obstacleBounds.x + obstacleBounds.width &&
                playerBounds.x + playerBounds.width > obstacleBounds.x &&
                playerBounds.y < obstacleBounds.y + obstacleBounds.height &&
                playerBounds.y + playerBounds.height > obstacleBounds.y
            ) {
                 // Check if it's a power-up
                if (obstacle.isPowerUp) {
                    console.log("Heart collected!");
                    player.isInvincible = true;
                    player.invincibilityTimer = 0; // Reset timer
                    obstacles.splice(i, 1); // Remove the heart
                    // Optionally add sound effect here
                    continue; // Skip rest of checks for this frame maybe?
                }

                // If player is invincible, ignore obstacle collisions
                if (player.isInvincible) {
                    console.log("Collision ignored (Invincible)");
                    continue; // Skip to next obstacle
                }

                // Collision detected with a normal obstacle!
                showGameOver();
                return; // Exit loop once collision occurs
            }
        }
    }

    function updateScoreAndSpeed(deltaTime) {
        let speedChanged = false;
        // --- Score-based speed increase ---
        scoreUpdateTimer += deltaTime;
        if (scoreUpdateTimer >= SCORE_INCREMENT_INTERVAL) {
            const oldScore = Math.floor(score);
            score += 1; // Increment score
            const newScore = Math.floor(score);
            currentScoreDisplay.textContent = newScore;
            scoreUpdateTimer = 0; // Reset timer

            // Check if score crossed a speed increase threshold
            if (newScore % SPEED_INCREASE_INTERVAL === 0 && newScore > 0) {
                if (gameSpeed < MAX_GAME_SPEED) {
                    gameSpeed += SPEED_INCREASE_AMOUNT;
                    console.log("Speed increased (score) towards:", gameSpeed);
                    speedChanged = true;
                }
            }

            // Check if score crossed a speed PHASE threshold
            if (Math.floor(oldScore / SCORE_SPEED_PHASE_INTERVAL) !== Math.floor(newScore / SCORE_SPEED_PHASE_INTERVAL)) {
                currentSpeedPhase = (currentSpeedPhase + 1) % SPEED_PHASE_MULTIPLIERS.length;
                console.log("Speed Phase changed to:", currentSpeedPhase);
                speedChanged = true;
            }
        }

        // --- Time-based speed increase ---
        if (currentScreenState === 'game') {
            timeSinceLastSpeedIncrease += deltaTime;
            if (timeSinceLastSpeedIncrease >= TIME_SPEED_INCREASE_INTERVAL) {
                if (gameSpeed < MAX_GAME_SPEED) {
                    gameSpeed += TIME_SPEED_INCREASE_AMOUNT;
                     console.log("Speed increased (time) towards:", gameSpeed);
                     speedChanged = true;
                }
                timeSinceLastSpeedIncrease = 0; // Reset timer
            }
        }

        // Apply speed phase multiplier
        const effectiveGameSpeed = Math.min(gameSpeed * SPEED_PHASE_MULTIPLIERS[currentSpeedPhase], MAX_GAME_SPEED);

        if (speedChanged) {
            console.log(`Current base speed: ${gameSpeed.toFixed(2)}, Phase: ${currentSpeedPhase}, Multiplier: ${SPEED_PHASE_MULTIPLIERS[currentSpeedPhase]}, Effective speed: ${effectiveGameSpeed.toFixed(2)}`);
        }

        // Return the effective speed for this frame
        return effectiveGameSpeed;
    }

    function handleSpawning(deltaTime, currentScore) {
        spawnTimer += deltaTime;

        if (spawnTimer >= timeToNextSpawn) {
            // Determine available obstacles based on score
            const difficultyLevel = Math.floor(currentScore / DIFFICULTY_SCORE_INTERVAL);
            let availableObstacles = [WaterObstacle, EnemyBotObstacle];

            if (difficultyLevel >= 1) {
                availableObstacles.push(SpikeObstacle);
                availableObstacles.push(EnemyBotObstacle); // Slightly increase bot chance
            }
            if (difficultyLevel >= 2) { // Score 500+
                 availableObstacles.push(SpikeObstacle);
                 availableObstacles.push(FlyingObstacle);
                 availableObstacles.push(FlyingObstacle);
                 availableObstacles.push(BouncingObstacle); // Introduce bouncing obstacles
            }
            if (difficultyLevel >= 3) { // Score 750+
                 availableObstacles.push(SpikeObstacle);      // More spikes
                 availableObstacles.push(EnemyBotObstacle);   // More bots
                 availableObstacles.push(FlyingObstacle);     // More flying
                 availableObstacles.push(BouncingObstacle);   // More bouncing
            }

            // Add Heart PowerUp spawn chance (e.g., 5% chance instead of obstacle)
            if (Math.random() < 0.05 && currentScreenState === 'game' && player && !player.isInvincible) {
                // Spawn heart instead
                obstacles.push(new HeartPowerUp()); // Using 'obstacles' array for simplicity
                console.log('Heart Spawned');
            } else {
                 // Randomly choose an available obstacle type
                const randomIndex = Math.floor(Math.random() * availableObstacles.length);
                const obstacleType = availableObstacles[randomIndex];
                obstacles.push(new obstacleType());
            }

            spawnTimer = 0;
            // Adjust spawn interval slightly based on difficulty & increase range
             let baseMinSpawn = MIN_SPAWN_INTERVAL;
             let baseMaxSpawn = MAX_SPAWN_INTERVAL;
             let spawnRangeIncrease = difficultyLevel * 15; // Increase range more significantly

             let adjustedMinSpawn = Math.max(35, baseMinSpawn - difficultyLevel * 5);
             let adjustedMaxSpawn = Math.max(adjustedMinSpawn + 40, baseMaxSpawn - difficultyLevel * 10); // Ensure min range
             let currentRange = adjustedMaxSpawn - adjustedMinSpawn + spawnRangeIncrease;

            timeToNextSpawn = Math.random() * currentRange + adjustedMinSpawn;
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

    // --- Heart PowerUp Class (treated like an obstacle for collision/spawning) ---
    class HeartPowerUp extends Obstacle {
        constructor() {
            const size = 25;
            const x = CANVAS_WIDTH;
            // Spawn within jump range, similar to FlyingObstacle
            const playerMaxReach = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT - MAX_JUMP_HEIGHT_ESTIMATE;
            const minY = Math.max(30, playerMaxReach);
            const maxY = CANVAS_HEIGHT - GROUND_HEIGHT - size - 50;
            const y = Math.random() * (maxY - minY) + minY;
            super(x, y, size, size);
            this.isPowerUp = true; // Flag to identify it in collision check
        }

        update(currentGameSpeed, deltaTime) {
            super.update(currentGameSpeed, deltaTime);
            // Add a slight vertical bobbing effect
            this.y += Math.sin(this.animationTimer * 1.2) * 0.5 * deltaTime;
        }

        draw() {
            // Draw a simple heart shape
            ctx.fillStyle = HEART_COLOR;
            ctx.beginPath();
            const d = Math.min(this.width, this.height);
            const k = this.x;
            const l = this.y;
            ctx.moveTo(k, l + d / 4);
            ctx.quadraticCurveTo(k, l, k + d / 4, l);
            ctx.quadraticCurveTo(k + d / 2, l, k + d / 2, l + d / 4);
            ctx.quadraticCurveTo(k + d / 2, l, k + d * 3/4, l);
            ctx.quadraticCurveTo(k + d, l, k + d, l + d / 4);
            ctx.quadraticCurveTo(k + d, l + d / 2, k + d * 3/4, l + d * 3/4);
            ctx.lineTo(k + d / 2, l + d);
            ctx.lineTo(k + d / 4, l + d * 3/4);
            ctx.quadraticCurveTo(k, l + d / 2, k, l + d / 4);
            ctx.fill();
        }
    }

    // Initial setup on load
    setupStartScreen(); // Setup initial screen state
    requestAnimationFrame(gameLoop); // Start the main loop immediately
    // loadHighScores(); // Moved to setupStartScreen/showGameOver
    // updateHighScoresDisplay(); // Moved to setupStartScreen/showGameOver

}); 