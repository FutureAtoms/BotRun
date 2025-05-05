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
    const soundToggle = document.getElementById('sound-toggle');
    
    // Sound effects
    const sounds = {
        jump: new Audio('sounds/smb_jump-small.wav'),
        gameOver: new Audio('sounds/smb_mariodie.wav'),
        powerUp: new Audio('sounds/smb_powerup.wav')
    };
    
    // Flag to track if sounds are muted
    let soundMuted = false;

    // Function to update sound toggle button
    function updateSoundToggle() {
        soundToggle.textContent = soundMuted ? '🔇' : '🔊';
    }

    // Initialize sound toggle
    updateSoundToggle();

    // Sound toggle click handler
    soundToggle.addEventListener('click', () => {
        soundMuted = !soundMuted;
        updateSoundToggle();
        console.log(`Sound ${soundMuted ? 'muted' : 'unmuted'}`);
    });

    // Function to play sound with option to mute
    function playSound(sound) {
        if (!soundMuted) {
            sound.currentTime = 0; // Reset sound to beginning
            sound.play().catch(e => console.log("Error playing sound:", e));
        }
    }

    // Set canvas to fill window and handle resizing
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Initial canvas sizing
    resizeCanvas();
    
    // Handle window resize events
    window.addEventListener('resize', () => {
        resizeCanvas();
    });

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
    const GROUND_HEIGHT = 100; // Increased from 80 to 100 - Height of the ground area
    const BOTTOM_BUFFER = 100; // Added buffer from bottom for all elements
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

    // --- Animation variables for start screen ---
    let startScreenCloudPositions = [];
    let botBounceHeight = 0;
    let botBounceDirection = 1;
    let botRotation = 0;
    let enemyBotPosition = -100;
    let heartPosition = {x: 0, y: 0, scale: 0.8};
    let heartPulse = 0;
    let botBlinkTimer = 0;
    let botIsBlinking = false;

    // Weather effects
    let isRaining = false;
    let rainTimer = 0;
    let rainDuration = 0;
    let rainInterval = 0; // Time until next rain
    const MIN_RAIN_INTERVAL = 600; // Minimum frames between rain events
    const MAX_RAIN_INTERVAL = 1200; // Maximum frames between rain events
    const MIN_RAIN_DURATION = 300; // Minimum frames rain lasts
    const MAX_RAIN_DURATION = 600; // Maximum frames rain lasts
    let raindrops = [];
    const RAINDROP_COUNT = 200;
    let stormClouds = [];
    const STORM_CLOUD_COUNT = 5;
    let groundSlipperiness = 0; // 0 to 1, affects jump physics

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
            // Make water obstacles narrower overall
            const width = Math.random() * 40 + 40; // Reduced from 60+70 to 40+40
            const height = Math.random() * 15 + 20; // Slightly higher water
            const x = canvas.width;
            const y = canvas.height - height - GROUND_HEIGHT - BOTTOM_BUFFER; // Added bottom buffer
            super(x, y, width, height);
            this.baseHeight = height; // Store original height for animation
            this.rippleAmplitude = 6; // Increased wave amplitude
            this.waveFrequency = 0.15 + Math.random() * 0.1; // Different wave frequencies
            this.wavePoints = 8; // Number of points to create the wave
            this.wavePhase = Math.random() * Math.PI * 2; // Random start phase
            this.isWide = width > 65; // Flag to identify wider water obstacles
        }

        update(currentGameSpeed, deltaTime) {
            super.update(currentGameSpeed, deltaTime); // Call base update for movement
            
            // Update the wave phase for animation
            this.wavePhase += this.waveFrequency * deltaTime * 0.05;
            if (this.wavePhase > Math.PI * 2) {
                this.wavePhase -= Math.PI * 2;
            }
        }

        draw() {
            ctx.fillStyle = WATER_COLOR;
            
            // Create wavy water with dynamic wave effect
            ctx.beginPath();
            
            // Start at bottom left of water section
            ctx.moveTo(this.x, canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER);
            
            // Draw the top wavy part
            const pointWidth = this.width / (this.wavePoints - 1);
            for (let i = 0; i < this.wavePoints; i++) {
                const xPos = this.x + i * pointWidth;
                const yOffset = Math.sin(this.wavePhase + i * 0.5) * this.rippleAmplitude;
                const yPos = this.y + yOffset;
                
                if (i === 0) {
                    ctx.moveTo(xPos, yPos);
                } else {
                    ctx.lineTo(xPos, yPos);
                }
            }
            
            // Complete the shape by connecting to bottom right then bottom left
            ctx.lineTo(this.x + this.width, canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER);
            ctx.lineTo(this.x, canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER);
            ctx.closePath();
            ctx.fill();
            
            // Add a subtle highlight for wave shine
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < this.wavePoints - 1; i++) {
                const xPos = this.x + i * pointWidth;
                const yOffset = Math.sin(this.wavePhase + i * 0.5) * this.rippleAmplitude;
                const yPos = this.y + yOffset;
                
                if (i === 0) {
                    ctx.moveTo(xPos, yPos);
                } else {
                    ctx.lineTo(xPos, yPos);
                }
            }
            ctx.stroke();
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
            const x = canvas.width;
            const baseY = canvas.height - height - GROUND_HEIGHT - BOTTOM_BUFFER - 5; // Added bottom buffer
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

    // --- Mountain Obstacle Class (formerly Spike) ---
    class SpikeObstacle extends Obstacle {
        constructor() {
            const width = Math.random() * 30 + 25; // Slightly wider for mountain appearance
            const height = Math.random() * 25 + 30; // Slightly taller for mountain appearance
            const x = canvas.width;
            const y = canvas.height - height - GROUND_HEIGHT - BOTTOM_BUFFER; // Added bottom buffer
            super(x, y, width, height);
            
            // Snow cap variables
            this.snowCapHeight = this.height * (0.2 + Math.random() * 0.15); // Top 20-35% is snow
            this.hasTrees = Math.random() > 0.5; // 50% chance of having trees
            this.treeCount = Math.floor(Math.random() * 3) + 1; // 1-3 trees if hasTrees is true
            this.trees = [];
            
            if (this.hasTrees) {
                // Generate positions for trees
                for (let i = 0; i < this.treeCount; i++) {
                    const treeHeight = Math.random() * 8 + 10;
                    const treePosX = this.width * 0.2 + Math.random() * (this.width * 0.6); // Position in middle 60% of mountain width
                    const treePosY = this.height - treeHeight - Math.random() * (this.height * 0.4); // Position in lower half of mountain
                    this.trees.push({
                        x: treePosX,
                        y: treePosY,
                        height: treeHeight,
                        width: treeHeight * 0.6
                    });
                }
            }
        }

        update(currentGameSpeed, deltaTime) {
            super.update(currentGameSpeed, deltaTime);
        }

        draw() {
            // Draw mountain base
            const mountainGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            mountainGradient.addColorStop(0, '#4b5054'); // Lighter grey at top
            mountainGradient.addColorStop(1, '#2c3e50'); // Darker at bottom
            
            ctx.fillStyle = mountainGradient;
            ctx.beginPath();
            
            // Draw mountain shape with more natural look
            ctx.moveTo(this.x, this.y + this.height); // Bottom left
            
            // Left side with slight variation
            const leftCpX = this.x + this.width * 0.2;
            const leftCpY = this.y + this.height * 0.7;
            
            // Peak with slight offset
            const peakX = this.x + this.width * (0.45 + Math.random() * 0.1); // Slight randomness to peak position
            const peakY = this.y;
            
            // Right side with variation
            const rightCpX = this.x + this.width * 0.8;
            const rightCpY = this.y + this.height * 0.6;
            
            // Create the mountain profile using bezier curves for a more natural look
            ctx.bezierCurveTo(leftCpX, leftCpY, this.x + this.width * 0.3, this.y + this.height * 0.3, peakX, peakY);
            ctx.bezierCurveTo(this.x + this.width * 0.6, this.y + this.height * 0.25, rightCpX, rightCpY, this.x + this.width, this.y + this.height);
            
            ctx.closePath();
            ctx.fill();
            
            // Draw snow cap
            ctx.fillStyle = 'white';
            ctx.beginPath();
            
            const snowStartY = this.y + (this.snowCapHeight * 0.5); // Start snow a bit below peak
            
            // Draw snow cap
            ctx.moveTo(peakX - this.width * 0.15, snowStartY);
            ctx.lineTo(peakX, this.y); // Peak
            ctx.lineTo(peakX + this.width * 0.15, snowStartY);
            
            // Create curved bottom edge for snow
            ctx.bezierCurveTo(
                peakX + this.width * 0.1, snowStartY + this.snowCapHeight * 0.5,
                peakX - this.width * 0.1, snowStartY + this.snowCapHeight * 0.5,
                peakX - this.width * 0.15, snowStartY
            );
            
            ctx.closePath();
            ctx.fill();
            
            // Draw trees if present
            if (this.hasTrees) {
                for (const tree of this.trees) {
                    const treeX = this.x + tree.x;
                    const treeY = this.y + tree.y;
                    
                    // Draw trunk
                    ctx.fillStyle = '#8B4513'; // Brown
                    ctx.fillRect(treeX - tree.width * 0.1, treeY + tree.height * 0.6, tree.width * 0.2, tree.height * 0.4);
                    
                    // Draw tree (triangle)
                    ctx.fillStyle = '#2ecc71'; // Green
                    ctx.beginPath();
                    ctx.moveTo(treeX - tree.width / 2, treeY + tree.height * 0.6);
                    ctx.lineTo(treeX, treeY);
                    ctx.lineTo(treeX + tree.width / 2, treeY + tree.height * 0.6);
                    ctx.closePath();
                    ctx.fill();
                    
                    // Draw second layer of foliage
                    ctx.beginPath();
                    ctx.moveTo(treeX - tree.width / 2, treeY + tree.height * 0.4);
                    ctx.lineTo(treeX, treeY + tree.height * 0.1);
                    ctx.lineTo(treeX + tree.width / 2, treeY + tree.height * 0.4);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }

    // --- Flying Obstacle Class ---
    class FlyingObstacle extends Obstacle {
        constructor() {
            const size = Math.random() * 15 + 20;
            const x = canvas.width;
            // Position higher up, BUT within jump range
            const playerMaxReach = canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER - PLAYER_HEIGHT - MAX_JUMP_HEIGHT_ESTIMATE;
            const minY = Math.max(30, playerMaxReach); // Don't go below 30px from top, ensure reachable
            const maxY = canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER - size - 50; // Ensure it's well above ground
            const y = Math.random() * (maxY - minY) + minY; // Random Y within the calculated range
            super(x, y, size, size);
            
            // Add circular motion variables
            this.baseY = this.y; // Store original Y position
            this.circleRadius = Math.random() * 15 + 5; // Random radius for circular motion
            this.circleSpeed = Math.random() * 0.05 + 0.02; // Random speed for circular motion
            this.circleAngle = Math.random() * Math.PI * 2; // Random starting angle
            this.rotationAngle = 0; // For spinning the diamond
        }

        update(currentGameSpeed, deltaTime) {
            // Horizontal movement (standard)
            super.update(currentGameSpeed, deltaTime);
            
            // Circular motion
            this.circleAngle += this.circleSpeed * deltaTime;
            if (this.circleAngle > Math.PI * 2) {
                this.circleAngle -= Math.PI * 2; // Keep angle in reasonable range
            }
            
            // Update Y position with circular motion
            this.y = this.baseY + Math.sin(this.circleAngle) * this.circleRadius;
            
            // Update rotation for spinning effect
            this.rotationAngle += 0.02 * deltaTime;
            if (this.rotationAngle > Math.PI * 2) {
                this.rotationAngle -= Math.PI * 2;
            }
        }

        draw() {
            ctx.fillStyle = FLYING_OBSTACLE_COLOR;
            ctx.save();
            // Position at center of object
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            // Add rotation for spinning diamond (combine fixed 45° with dynamic rotation)
            ctx.rotate(Math.PI / 4 + this.rotationAngle);
            // Draw diamond (square rotated 45°)
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }

    // --- Bouncing Obstacle Class ---
    class BouncingObstacle extends Obstacle {
        constructor() {
            const size = Math.random() * 10 + 20; // Bouncing ball size
            const x = canvas.width;
            const y = canvas.height / 2; // Start mid-screen vertically
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
            const groundLevel = canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER - this.radius;
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
                this.x = canvas.width + Math.random() * 200; // Reappear on the right
                this.y = Math.random() * (canvas.height / 3); // Randomize height slightly
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
            this.y = canvas.height - this.height - GROUND_HEIGHT - BOTTOM_BUFFER; // Added bottom buffer
            this.velocityY = 0;
            this.isGrounded = true;
            this.jumpScale = 1; // For visual jump effect
            this.isJumpingVisual = false;
            this.isInvincible = false;
            this.invincibilityTimer = 0;
            this.slideFactor = 0; // For slipping on wet ground
            this.blinkTimer = Math.random() * 5; // Randomize blink start
            this.isBlinking = false;
            this.antennaAngle = 0;
            this.armAngle = 0; // Angle for simple arm swing
        }

        draw() {
            ctx.save();

            // Glow effect if invincible
            if (this.isInvincible) {
                const blinkRate = 10;
                const alpha = (Math.sin(this.invincibilityTimer * (Math.PI * 2 / blinkRate)) + 1) / 2 * 0.5 + 0.3;
                ctx.shadowColor = `rgba(255, 255, 0, ${alpha})`;
                ctx.shadowBlur = 20;
            }

            // Apply jump scaling effect
            const scaleX = this.isJumpingVisual ? 0.9 : 1;
            const scaleY = this.isJumpingVisual ? 1.1 : 1;
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(scaleX, scaleY);
            ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

            // --- Cute Modern Robot Design ---
            const bodyColor = '#d0d3d4'; // Light grey
            const accentColor = '#3498db'; // Blue accent
            const darkColor = '#566573'; // Dark grey
            const eyeColor = '#2ecc71'; // Green eyes
            const cornerRadius = 5;

            // Body (main rectangle)
            ctx.fillStyle = bodyColor;
            roundRect(ctx, this.x, this.y, this.width, this.height, cornerRadius, true, false);
            
            // Outline
            ctx.strokeStyle = darkColor;
            ctx.lineWidth = 2;
            roundRect(ctx, this.x, this.y, this.width, this.height, cornerRadius, false, true);

            // Antenna
            const antennaBaseX = this.x + this.width / 2;
            const antennaBaseY = this.y;
            const antennaHeight = 15;
            const antennaBallRadius = 4;
            
            ctx.strokeStyle = darkColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(antennaBaseX, antennaBaseY);
            // Animate antenna slightly
            this.antennaAngle = Math.sin(Date.now() / 300) * 0.2;
            ctx.lineTo(antennaBaseX + Math.sin(this.antennaAngle) * antennaHeight, antennaBaseY - Math.cos(this.antennaAngle) * antennaHeight);
            ctx.stroke();
            
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.arc(antennaBaseX + Math.sin(this.antennaAngle) * antennaHeight, antennaBaseY - Math.cos(this.antennaAngle) * antennaHeight, antennaBallRadius, 0, Math.PI * 2);
            ctx.fill();

            // Manage blinking effect
            this.blinkTimer += 0.05;
            if (this.blinkTimer > 5) { // Blink every 5 "seconds"
                this.isBlinking = true;
                if (this.blinkTimer > 5.2) { // Blink duration
                    this.isBlinking = false;
                    this.blinkTimer = 0;
                }
            }

            // Eyes (Round green LEDs)
            const eyeRadius = this.height * 0.15;
            const eyeOffsetX = this.width * 0.25;
            const eyeOffsetY = this.height * 0.35;
            const pupilRadius = eyeRadius * 0.4;

            if (this.isBlinking) {
                // Draw closed eyes (lines)
                ctx.strokeStyle = darkColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x + eyeOffsetX - eyeRadius * 0.7, this.y + eyeOffsetY);
                ctx.lineTo(this.x + eyeOffsetX + eyeRadius * 0.7, this.y + eyeOffsetY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.x + this.width - eyeOffsetX - eyeRadius * 0.7, this.y + eyeOffsetY);
                ctx.lineTo(this.x + this.width - eyeOffsetX + eyeRadius * 0.7, this.y + eyeOffsetY);
                ctx.stroke();
            } else {
                // Draw open eyes
                // Outer circle (dark)
                ctx.fillStyle = darkColor;
                ctx.beginPath();
                ctx.arc(this.x + eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.x + this.width - eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Inner glowing part (green)
                ctx.fillStyle = eyeColor;
                ctx.beginPath();
                ctx.arc(this.x + eyeOffsetX, this.y + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.x + this.width - eyeOffsetX, this.y + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Tiny highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(this.x + eyeOffsetX + pupilRadius * 0.3, this.y + eyeOffsetY - pupilRadius * 0.3, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.x + this.width - eyeOffsetX + pupilRadius * 0.3, this.y + eyeOffsetY - pupilRadius * 0.3, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Mouth/Speaker Grill (optional simple lines)
            ctx.strokeStyle = darkColor;
            ctx.lineWidth = 1;
            const grillY = this.y + this.height * 0.7;
            const grillWidth = this.width * 0.3;
            for(let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x + this.width / 2 - grillWidth / 2, grillY + i * 3);
                ctx.lineTo(this.x + this.width / 2 + grillWidth / 2, grillY + i * 3);
                ctx.stroke();
            }

            // Simple legs (rectangles)
            const legWidth = this.width * 0.2;
            const legHeight = this.height * 0.15;
            const legY = this.y + this.height - legHeight;
            const legSpacing = this.width * 0.1;

            ctx.fillStyle = darkColor;
            ctx.fillRect(this.x + legSpacing, legY, legWidth, legHeight);
            ctx.fillRect(this.x + this.width - legSpacing - legWidth, legY, legWidth, legHeight);

            // Add a small blue panel/light on the body
            ctx.fillStyle = accentColor;
            ctx.fillRect(this.x + this.width * 0.1, this.y + this.height * 0.1, this.width * 0.15, this.height * 0.1);

            ctx.restore(); // Restore context state (removes shadow/scale)
        }

        update(deltaTime) {
            // Apply gravity
            this.velocityY += GRAVITY * deltaTime;
            this.y += this.velocityY * deltaTime;
            
            // Update sliding based on ground slipperiness
            if (this.isGrounded && groundSlipperiness > 0) {
                // Calculate slide factor based on ground slipperiness
                this.slideFactor = Math.min(1, this.slideFactor + groundSlipperiness * 0.01 * deltaTime);
                
                // Randomly slide a bit when slippery
                if (Math.random() < this.slideFactor * 0.02 * deltaTime) {
                    // Small random slide in x direction (purely visual since player's x position is fixed)
                    const slideEffect = (Math.random() - 0.5) * this.slideFactor * 2;
                    // Make it harder to jump when sliding
                    if (Math.random() < this.slideFactor * 0.01 * deltaTime) {
                        this.velocityY = 1; // Small bump
                    }
                }
            } else {
                // Reduce slide factor when not on ground
                this.slideFactor = Math.max(0, this.slideFactor - 0.01 * deltaTime);
            }

            // Ground collision
            const groundLevel = canvas.height - this.height - GROUND_HEIGHT - BOTTOM_BUFFER;
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
                // If ground is slippery, reduce jump height and add randomness
                let jumpPower = JUMP_STRENGTH;
                
                if (groundSlipperiness > 0) {
                    // Reduce jump strength based on slipperiness
                    const jumpReduction = 1 - (groundSlipperiness * 0.3);
                    jumpPower *= jumpReduction;
                    
                    // Add randomness to jump direction when slippery
                    if (Math.random() < groundSlipperiness * 0.5) {
                        // Sometimes slip instead of proper jump
                        jumpPower *= (0.5 + Math.random() * 0.5);
                        console.log("Slippery jump: " + jumpPower);
                    }
                }
                
                this.velocityY = jumpPower;
                this.isGrounded = false;
                this.isJumpingVisual = true; // Start visual effect immediately
                
                // Play jump sound
                playSound(sounds.jump);
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
        
        // Toggle sound mute with 'M' key
        if (e.code === 'KeyM') {
            soundMuted = !soundMuted;
            console.log(`Sound ${soundMuted ? 'muted' : 'unmuted'}`);
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

        // Initialize start screen animations
        startScreenCloudPositions = [];
        for (let i = 0; i < 5; i++) {
            startScreenCloudPositions.push({
                x: Math.random() * canvas.width,
                y: Math.random() * (canvas.height * 0.4),
                size: Math.random() * 30 + 40,
                speed: Math.random() * 0.3 + 0.2
            });
        }
        
        // Reset bouncing bot animation
        botBounceHeight = 0;
        botBounceDirection = 1;
        botRotation = 0;
        
        // Position enemy bot off-screen initially
        enemyBotPosition = -100;
        
        // Position heart
        heartPosition = {
            x: canvas.width * 0.2,
            y: canvas.height * 0.7,
            scale: 0.8
        };
        heartPulse = 0;

        // Hide game elements, show start screen (title will be on canvas)
        startScreen.style.display = 'block';
        gameOverScreen.style.display = 'none';
        canvas.style.display = 'block'; // Canvas is always visible now
        scoreDisplay.style.display = 'none';
        soundToggle.style.display = 'block'; // Show sound toggle

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
            const size = Math.random() * 20 + 15;
            const x = Math.random() * canvas.width;
            const y = Math.random() * (canvas.height / 3);
            const speed = Math.random() * 0.5 + 0.1;
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
        initializeWeatherSystem(); // Initialize weather effects
        gameStartTime = Date.now(); // Record start time
        currentBackgroundColor = '#87CEEB'; // Reset background color
        lastTime = 0; // Reset lastTime for delta time calculation

        // Hide screens, show canvas/score (title managed by game loop)
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        canvas.style.display = 'block';
        scoreDisplay.style.display = 'block';
        soundToggle.style.display = 'block';  // Show sound toggle

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
        const x = canvas.width / 2;
        const y = canvas.height / 3; // Position title higher up

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
        ctx.font = `bold 50px 'Arial', sans-serif`; // Bolder font
        ctx.fillStyle = '#e74c3c'; // Red color
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Dark shadow
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Position above the defeated robot
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60); 
        
        // Reset shadow for other drawings
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let currentFrameSpeed = gameSpeed; // Default speed if not in game

        // --- State-based Drawing and Logic ---
        switch (currentScreenState) {
            case 'start':
                // Draw background gradient
                const startGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                startGradient.addColorStop(0, '#3498db'); // Sky blue at top
                startGradient.addColorStop(0.85, '#2980b9'); // Darker blue near ground
                ctx.fillStyle = startGradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw ground - start screen
                ctx.fillStyle = '#2ecc71'; // Green ground
                ctx.fillRect(0, canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER, canvas.width, GROUND_HEIGHT * 0.4); // Top 40% as grass
                
                // Draw dirt below ground
                ctx.fillStyle = '#8B4513'; // Brown dirt
                ctx.fillRect(0, canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER + (GROUND_HEIGHT * 0.4), canvas.width, GROUND_HEIGHT * 0.6); // Bottom 60% as dirt

                // Draw bottom buffer area
                ctx.fillStyle = '#2c3e50'; // Dark color for buffer
                ctx.fillRect(0, canvas.height - BOTTOM_BUFFER, canvas.width, BOTTOM_BUFFER);
                
                // Draw animated clouds
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                startScreenCloudPositions.forEach(cloud => {
                    // Draw cloud
                    drawCloud(cloud.x, cloud.y, cloud.size);
                    
                    // Update cloud position
                    cloud.x -= cloud.speed * deltaTime;
                    if (cloud.x + cloud.size * 2 < 0) {
                        cloud.x = canvas.width + cloud.size;
                        cloud.y = Math.random() * (canvas.height * 0.4);
                    }
                });
                
                // Update bot bounce animation
                botBounceHeight += botBounceDirection * 0.2 * deltaTime;
                if (botBounceHeight > 10) botBounceDirection = -1;
                if (botBounceHeight < -10) botBounceDirection = 1;
                
                // Gradually move enemy bot on screen
                enemyBotPosition += 0.5 * deltaTime;
                if (enemyBotPosition > canvas.width + 100) {
                    enemyBotPosition = -100;
                }
                
                // Update heart animation
                heartPulse += 0.05 * deltaTime;
                const heartScale = heartPosition.scale + Math.sin(heartPulse) * 0.1;
                
                // Draw heart
                drawHeart(heartPosition.x, heartPosition.y, 30 * heartScale);
                
                // Draw enemy bot
                const enemySize = PLAYER_WIDTH * 0.8;
                drawEnemyBot(canvas.width - enemyBotPosition, canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER - enemySize, enemySize, enemySize);
                
                // Draw the animated player bot in the center
                drawAnimatedPlayerBot(canvas.width / 2, canvas.height / 2, 120, 150, botBounceHeight, botRotation);
                
                // Draw animated title
                drawAnimatedTitle(TARGET_TITLE, deltaTime);
                break;

            case 'gameOver':
                // Draw dark background with stars (similar to existing)
                ctx.fillStyle = GAME_OVER_BG_COLOR;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                stars.forEach(star => star.draw(1.0)); // Draw stars at full opacity
                
                // Draw defeated robot
                drawDefeatedRobot(canvas.width / 2, canvas.height / 2 + 50); // Position slightly lower
                
                // Draw "Game Over!" text with better styling
                drawGameOverText(); 
                
                // Draw animated title (optional, maybe remove for game over?)
                // drawAnimatedTitle(TARGET_TITLE, deltaTime);
                break;

            case 'game':
                // Update weather system
                updateWeather(deltaTime);
                
                // Update and get current frame speed with randomness
                currentFrameSpeed = updateScoreAndSpeed(deltaTime); 
                
                // Add subtle random speed variation (more pronounced during rain)
                if (Math.random() < 0.01) { // 1% chance each frame
                    const variationAmount = isRaining ? 0.2 : 0.1; // More variation during rain
                    const speedVariation = (Math.random() * 2 - 1) * variationAmount; // -0.1 to 0.1 normally, -0.2 to 0.2 during rain
                    currentFrameSpeed = Math.max(1, Math.min(MAX_GAME_SPEED, currentFrameSpeed + speedVariation));
                }
                
                // During rain, have moments of sudden speed changes
                if (isRaining && Math.random() < 0.001) { // 0.1% chance during rain
                    const suddenChange = Math.random() < 0.5 ? 0.5 : -0.5; // Either suddenly faster or slower
                    currentFrameSpeed = Math.max(1, Math.min(MAX_GAME_SPEED, currentFrameSpeed + suddenChange));
                    console.log("Sudden speed change during rain: " + (suddenChange > 0 ? "faster" : "slower"));
                }
                
                const darknessLevel = updateBackgroundColor();
                ctx.fillStyle = currentBackgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                if (darknessLevel > STAR_VISIBILITY_THRESHOLD) {
                    const starOpacityMultiplier = (darknessLevel - STAR_VISIBILITY_THRESHOLD) / (1 - STAR_VISIBILITY_THRESHOLD);
                    stars.forEach(star => star.draw(starOpacityMultiplier));
                }
                
                // Draw ground - game state
                if (groundSlipperiness > 0) {
                    // Make ground look wet/darker when slippery
                    const wetFactor = Math.min(0.6, groundSlipperiness);
                    ctx.fillStyle = `rgba(46, 204, 113, ${1 - wetFactor})`;
                } else {
                    ctx.fillStyle = '#2ecc71'; // Green ground
                }
                ctx.fillRect(0, canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER, canvas.width, GROUND_HEIGHT * 0.4); // Top 40% as grass
                
                // Draw dirt below ground
                ctx.fillStyle = '#8B4513'; // Brown dirt
                ctx.fillRect(0, canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER + (GROUND_HEIGHT * 0.4), canvas.width, GROUND_HEIGHT * 0.6); // Bottom 60% as dirt
                
                // Draw bottom buffer area
                ctx.fillStyle = '#2c3e50'; // Dark color for buffer
                ctx.fillRect(0, canvas.height - BOTTOM_BUFFER, canvas.width, BOTTOM_BUFFER);
                
                // Draw clouds/environment
                backgroundElements.forEach(element => {
                    element.update(currentFrameSpeed * 0.5 * deltaTime);
                    element.draw();
                });
                
                // Update and draw player
                player.update(deltaTime);
                player.draw();
                
                // Spawn and update obstacles
                handleSpawning(deltaTime, score);
                obstacles.forEach(obstacle => {
                    obstacle.update(currentFrameSpeed, deltaTime);
                    obstacle.draw();
                });
                obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
                
                // Check for collisions
                handleCollisions();
                
                // Draw weather effects (rain, storm clouds, etc.)
                drawWeather();
                break;
        }
    }

    function showGameOver() {
        console.log("Game Over!");
        // isGameOver = true; // No longer just a flag, change the state
        currentScreenState = 'gameOver';
        animatedTitleText = ''; // Reset title animation for game over
        titleAnimationTimer = 0;

        // Play game over sound
        playSound(sounds.gameOver);

        updateHighScores(playerName, score);
        updateHighScoresDisplay(); // Update display on game over screen

        createStars(); // Ensure stars are ready for game over screen

        // Display game over screen HTML elements (except title)
        finalScoreDisplay.textContent = Math.floor(score);
        scoreDisplay.style.display = 'none'; // Hide in-game score
        gameOverScreen.style.display = 'block'; // Show HTML game over info
        startScreen.style.display = 'none'; // Hide start screen elements
        soundToggle.style.display = 'block'; // Keep sound toggle visible

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
                    
                    // Play power-up sound
                    playSound(sounds.powerUp);
                    
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
            let availableObstacles = [];
            
            // No water obstacles for the first 100 score
            if (currentScore < 100) {
                availableObstacles = [EnemyBotObstacle];
            } else {
                availableObstacles = [WaterObstacle, EnemyBotObstacle];
            }

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
                const newObstacle = new obstacleType();
                
                // If it's a wider water obstacle, spawn a heart before it
                if (newObstacle instanceof WaterObstacle && newObstacle.isWide) {
                    // Create a heart power-up slightly ahead of the water
                    const heartPowerUp = new HeartPowerUp();
                    heartPowerUp.x = canvas.width + 150; // Position heart ahead of the water obstacle
                    obstacles.push(heartPowerUp);
                    console.log('Heart spawned before wide water');
                    
                    // Position the water obstacle further to the right
                    newObstacle.x = canvas.width + 300;
                }
                
                obstacles.push(newObstacle);
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
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * (canvas.height * 0.7); // Stars in top 70% of screen
            this.size = Math.random() * 2 + 1;
            this.twinkleSpeed = Math.random() * 0.05 + 0.01;
            this.twinklePhase = Math.random() * Math.PI * 2;
        }
        
        draw(opacityMultiplier = 1.0) {
            const twinkle = (Math.sin(this.twinklePhase) + 1) * 0.5; // 0 to 1 range
            ctx.fillStyle = `rgba(255, 255, 255, ${(0.3 + twinkle * 0.7) * opacityMultiplier})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Update twinkle for next frame
            this.twinklePhase += this.twinkleSpeed;
            if (this.twinklePhase > Math.PI * 2) {
                this.twinklePhase -= Math.PI * 2;
            }
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
            const x = canvas.width;
            // Spawn within jump range, similar to FlyingObstacle
            const playerMaxReach = canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER - PLAYER_HEIGHT - MAX_JUMP_HEIGHT_ESTIMATE;
            const minY = Math.max(30, playerMaxReach);
            const maxY = canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER - size - 50;
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

    // Helper function to draw a cloud
    function drawCloud(x, y, size) {
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
        ctx.arc(x + size * 0.7, y, size * 0.5, 0, Math.PI * 2);
        ctx.arc(x + size * 0.4, y + size * 0.2, size * 0.4, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    // Helper function to draw a simple bot when image isn't available
    function drawSimpleBot(x, y, width, height) {
        // Body (blue rounded rectangle)
        ctx.fillStyle = '#3498db';
        const cornerRadius = 10;
        roundRect(ctx, x - width / 2, y - height / 2, width, height, cornerRadius, true);
        
        // Eyes
        const eyeRadius = width * 0.15;
        const eyeOffsetX = width * 0.2;
        const eyeOffsetY = height * 0.1;
        
        // White part
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - eyeOffsetX, y - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX, y - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x - eyeOffsetX, y - eyeOffsetY, eyeRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX, y - eyeOffsetY, eyeRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - width * 0.2, y + height * 0.2);
        ctx.lineTo(x + width * 0.2, y + height * 0.2);
        ctx.stroke();
    }

    // Helper function to draw enemy bot
    function drawEnemyBot(x, y, width, height) {
        // Body (red rounded rectangle)
        ctx.fillStyle = ENEMY_BOT_COLOR;
        const cornerRadius = 5;
        roundRect(ctx, x, y, width, height, cornerRadius, true);
        
        // Eyes
        const eyeRadius = width * 0.15;
        const pupilRadius = eyeRadius * 0.5;
        const eyeOffsetX = width * 0.25;
        const eyeOffsetY = height * 0.35;

        // White part
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + width - eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Red pupil
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX + pupilRadius*0.2, y + eyeOffsetY - pupilRadius*0.2, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + width - eyeOffsetX - pupilRadius*0.2, y + eyeOffsetY - pupilRadius*0.2, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Helper function to draw a heart
    function drawHeart(x, y, size) {
        ctx.fillStyle = HEART_COLOR;
        ctx.beginPath();
        ctx.moveTo(x, y + size / 4);
        ctx.quadraticCurveTo(x, y, x + size / 4, y);
        ctx.quadraticCurveTo(x + size / 2, y, x + size / 2, y + size / 4);
        ctx.quadraticCurveTo(x + size / 2, y, x + size * 3/4, y);
        ctx.quadraticCurveTo(x + size, y, x + size, y + size / 4);
        ctx.quadraticCurveTo(x + size, y + size / 2, x + size * 3/4, y + size * 3/4);
        ctx.lineTo(x + size / 2, y + size);
        ctx.lineTo(x + size / 4, y + size * 3/4);
        ctx.quadraticCurveTo(x, y + size / 2, x, y + size / 4);
        ctx.fill();
    }

    // Helper function to draw rounded rectangles
    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke === 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        } else {
            const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
            for (let side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }
    }

    // Helper function to draw the animated player bot for the start screen
    function drawAnimatedPlayerBot(x, y, width, height, bounceOffset, rotation) {
        // Apply translation and rotation for bounce effect
        ctx.save();
        ctx.translate(x, y + bounceOffset);
        ctx.rotate(Math.sin(rotation) * 0.05);
        
        // --- Robot Design (similar to in-game Player.draw) ---
        const bodyColor = '#d0d3d4'; // Light grey
        const accentColor = '#3498db'; // Blue accent
        const darkColor = '#566573'; // Dark grey
        const eyeColor = '#2ecc71'; // Green eyes
        const cornerRadius = 10; // Larger radius for start screen bot

        // Body (main rectangle, relative to center)
        ctx.fillStyle = bodyColor;
        roundRect(ctx, -width / 2, -height / 2, width, height, cornerRadius, true, false);
        
        // Outline
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3;
        roundRect(ctx, -width / 2, -height / 2, width, height, cornerRadius, false, true);

        // Antenna
        const antennaBaseX = 0; // Relative to center
        const antennaBaseY = -height / 2;
        const antennaHeight = 25;
        const antennaBallRadius = 6;
        
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(antennaBaseX, antennaBaseY);
        // Animate antenna slightly
        const antennaAngle = Math.sin(Date.now() / 300) * 0.2;
        ctx.lineTo(antennaBaseX + Math.sin(antennaAngle) * antennaHeight, antennaBaseY - Math.cos(antennaAngle) * antennaHeight);
        ctx.stroke();
        
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(antennaBaseX + Math.sin(antennaAngle) * antennaHeight, antennaBaseY - Math.cos(antennaAngle) * antennaHeight, antennaBallRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Manage blinking effect (uses global start screen vars)
        botBlinkTimer += 0.05;
        if (botBlinkTimer > 5) {
            botIsBlinking = true;
            if (botBlinkTimer > 5.2) {
                botIsBlinking = false;
                botBlinkTimer = 0;
            }
        }
        
        // Eyes (Round green LEDs)
        const eyeRadius = height * 0.15;
        const eyeOffsetX = width * 0.25;
        const eyeOffsetY = -height * 0.05; // Slightly higher on start screen bot
        const pupilRadius = eyeRadius * 0.4;

        if (botIsBlinking) {
            // Draw closed eyes (lines)
            ctx.strokeStyle = darkColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-eyeOffsetX - eyeRadius * 0.7, eyeOffsetY);
            ctx.lineTo(-eyeOffsetX + eyeRadius * 0.7, eyeOffsetY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(eyeOffsetX - eyeRadius * 0.7, eyeOffsetY);
            ctx.lineTo(eyeOffsetX + eyeRadius * 0.7, eyeOffsetY);
            ctx.stroke();
        } else {
            // Draw open eyes
            // Outer circle (dark)
            ctx.fillStyle = darkColor;
            ctx.beginPath();
            ctx.arc(-eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner glowing part (green)
            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            ctx.arc(-eyeOffsetX, eyeOffsetY, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eyeOffsetX, eyeOffsetY, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Tiny highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(-eyeOffsetX + pupilRadius * 0.3, eyeOffsetY - pupilRadius * 0.3, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eyeOffsetX + pupilRadius * 0.3, eyeOffsetY - pupilRadius * 0.3, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Mouth/Speaker Grill (simple lines)
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 2;
        const grillY = height * 0.3;
        const grillWidth = width * 0.3;
        for(let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-grillWidth / 2, grillY + i * 4);
            ctx.lineTo(grillWidth / 2, grillY + i * 4);
            ctx.stroke();
        }

        // Simple legs (rectangles)
        const legWidth = width * 0.2;
        const legHeight = height * 0.15;
        const legY = height / 2 - legHeight;
        const legSpacing = width * 0.1;

        ctx.fillStyle = darkColor;
        ctx.fillRect(-legSpacing - legWidth, legY, legWidth, legHeight);
        ctx.fillRect(legSpacing, legY, legWidth, legHeight);
        
        // Add a small blue panel/light on the body
        ctx.fillStyle = accentColor;
        ctx.fillRect(-width * 0.4, -height * 0.4, width * 0.15, height * 0.1);
        
        ctx.restore(); // Restore context state
    }

    // Initial setup on load
    setupStartScreen(); // Setup initial screen state
    requestAnimationFrame(gameLoop); // Start the main loop immediately
    // loadHighScores(); // Moved to setupStartScreen/showGameOver
    // updateHighScoresDisplay(); // Moved to setupStartScreen/showGameOver

    // Create functions for initializing and handling storm clouds and rain

    function initializeWeatherSystem() {
        // Initialize rain intervals
        rainInterval = MIN_RAIN_INTERVAL + Math.random() * (MAX_RAIN_INTERVAL - MIN_RAIN_INTERVAL);
        rainTimer = 0;
        rainDuration = 0;
        isRaining = false;
        groundSlipperiness = 0;
        
        // Initialize raindrops (but only used when raining)
        raindrops = [];
        
        // Initialize storm clouds (they're always present but only visible during rain)
        stormClouds = [];
        for (let i = 0; i < STORM_CLOUD_COUNT; i++) {
            stormClouds.push({
                x: Math.random() * canvas.width,
                y: Math.random() * (canvas.height * 0.3), // Top 30% of screen
                size: Math.random() * 40 + 50, // Larger than regular clouds
                speed: Math.random() * 0.5 + 0.2,
                opacity: 0 // Start invisible
            });
        }
        
        // Rain only starts when score is at least 500
        console.log("Weather system initialized. Rain will begin randomly after score reaches 500.");
    }

    function createRaindrops() {
        raindrops = [];
        for (let i = 0; i < RAINDROP_COUNT; i++) {
            raindrops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                length: Math.random() * 10 + 5,
                speed: Math.random() * 10 + 15
            });
        }
    }

    function updateWeather(deltaTime) {
        // Update rain timer
        rainTimer += deltaTime;
        
        // Check if we should start/stop rain
        if (!isRaining && rainTimer >= rainInterval) {
            // Only start rain if score is above 500
            if (score >= 500) {
                // Start rain
                console.log("Starting rain event");
                isRaining = true;
                rainDuration = MIN_RAIN_DURATION + Math.random() * (MAX_RAIN_DURATION - MIN_RAIN_DURATION);
                rainTimer = 0;
                createRaindrops();
            } else {
                // Reset timer if score not high enough
                rainTimer = 0;
                rainInterval = MIN_RAIN_INTERVAL + Math.random() * (MAX_RAIN_INTERVAL - MIN_RAIN_INTERVAL);
            }
        } else if (isRaining && rainTimer >= rainDuration) {
            // Stop rain
            console.log("Stopping rain event");
            isRaining = false;
            rainInterval = MIN_RAIN_INTERVAL + Math.random() * (MAX_RAIN_INTERVAL - MIN_RAIN_INTERVAL);
            rainTimer = 0;
        }
        
        // Update storm clouds
        stormClouds.forEach(cloud => {
            // Always move clouds
            cloud.x -= cloud.speed * deltaTime;
            if (cloud.x + cloud.size * 2 < 0) {
                cloud.x = canvas.width + cloud.size;
                cloud.y = Math.random() * (canvas.height * 0.3);
            }
            
            // Fade in/out based on rain state
            if (isRaining && cloud.opacity < 1) {
                cloud.opacity = Math.min(1, cloud.opacity + 0.01 * deltaTime);
            } else if (!isRaining && cloud.opacity > 0) {
                cloud.opacity = Math.max(0, cloud.opacity - 0.005 * deltaTime);
            }
        });
        
        // Update raindrops if raining
        if (isRaining) {
            raindrops.forEach(drop => {
                drop.y += drop.speed * deltaTime;
                if (drop.y > canvas.height) {
                    drop.y = 0;
                    drop.x = Math.random() * canvas.width;
                }
            });
            
            // Update ground slipperiness (gradually increases while raining)
            groundSlipperiness = Math.min(0.8, groundSlipperiness + 0.002 * deltaTime);
        } else {
            // Ground gradually dries when not raining
            groundSlipperiness = Math.max(0, groundSlipperiness - 0.001 * deltaTime);
        }
    }

    function drawWeather() {
        // Draw storm clouds if visible
        stormClouds.forEach(cloud => {
            if (cloud.opacity > 0) {
                // Draw dark storm cloud
                ctx.fillStyle = `rgba(50, 60, 70, ${cloud.opacity})`;
                drawCloud(cloud.x, cloud.y, cloud.size);
            }
        });
        
        // Draw rain if raining
        if (isRaining) {
            ctx.strokeStyle = 'rgba(180, 200, 240, 0.6)';
            ctx.lineWidth = 1;
            raindrops.forEach(drop => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x - drop.length * 0.5, drop.y + drop.length); // Slight angle
                ctx.stroke();
            });
        }
        
        // Draw puddles on ground if slippery
        if (groundSlipperiness > 0) {
            // Draw puddles reflections on ground proportional to slipperiness
            const puddleCount = Math.floor(groundSlipperiness * 10) + 1;
            for (let i = 0; i < puddleCount; i++) {
                const puddleX = (canvas.width / (puddleCount + 1)) * (i + 1);
                const puddleWidth = 30 + Math.random() * 50 * groundSlipperiness;
                const puddleHeight = 5 + 10 * groundSlipperiness;
                
                // Draw puddle on ground
                ctx.fillStyle = `rgba(70, 130, 180, ${0.3 * groundSlipperiness})`;
                ctx.beginPath();
                ctx.ellipse(puddleX, canvas.height - GROUND_HEIGHT - BOTTOM_BUFFER + 5, puddleWidth, puddleHeight, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Helper function to draw the robot in a defeated state
    function drawDefeatedRobot(x, y) {
        const width = PLAYER_WIDTH * 1.5; // Slightly larger than game size
        const height = PLAYER_HEIGHT * 1.5;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Slight downward tilt
        ctx.rotate(0.1); 

        // --- Robot Design (similar to Player.draw) ---
        const bodyColor = '#b0b3b4'; // Slightly darker grey
        const accentColor = '#2980b9'; // Darker blue accent
        const darkColor = '#566573';
        const eyeColor = '#e74c3c'; // Red eyes for sad/error state
        const cornerRadius = 5;

        // Body (main rectangle)
        ctx.fillStyle = bodyColor;
        roundRect(ctx, -width / 2, -height / 2, width, height, cornerRadius, true, false);
        
        // Outline
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 2;
        roundRect(ctx, -width / 2, -height / 2, width, height, cornerRadius, false, true);

        // Antenna (drooping)
        const antennaBaseX = 0;
        const antennaBaseY = -height / 2;
        const antennaHeight = 15;
        const antennaBallRadius = 4;
        const antennaAngle = -0.8; // Drooping angle
        
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(antennaBaseX, antennaBaseY);
        ctx.lineTo(antennaBaseX + Math.sin(antennaAngle) * antennaHeight, antennaBaseY - Math.cos(antennaAngle) * antennaHeight);
        ctx.stroke();
        
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(antennaBaseX + Math.sin(antennaAngle) * antennaHeight, antennaBaseY - Math.cos(antennaAngle) * antennaHeight, antennaBallRadius, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (Sad/X shape or downcast lines)
        const eyeRadius = height * 0.15;
        const eyeOffsetX = width * 0.25;
        const eyeOffsetY = -height * 0.1;
        
        // Draw sad eyes (downward curve or X)
        ctx.strokeStyle = eyeColor; // Use red for emphasis
        ctx.lineWidth = 3;
        
        // Left Eye (X)
        ctx.beginPath();
        ctx.moveTo(-eyeOffsetX - eyeRadius * 0.5, eyeOffsetY - eyeRadius * 0.5);
        ctx.lineTo(-eyeOffsetX + eyeRadius * 0.5, eyeOffsetY + eyeRadius * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-eyeOffsetX + eyeRadius * 0.5, eyeOffsetY - eyeRadius * 0.5);
        ctx.lineTo(-eyeOffsetX - eyeRadius * 0.5, eyeOffsetY + eyeRadius * 0.5);
        ctx.stroke();

        // Right Eye (X)
        ctx.beginPath();
        ctx.moveTo(eyeOffsetX - eyeRadius * 0.5, eyeOffsetY - eyeRadius * 0.5);
        ctx.lineTo(eyeOffsetX + eyeRadius * 0.5, eyeOffsetY + eyeRadius * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eyeOffsetX + eyeRadius * 0.5, eyeOffsetY - eyeRadius * 0.5);
        ctx.lineTo(eyeOffsetX - eyeRadius * 0.5, eyeOffsetY + eyeRadius * 0.5);
        ctx.stroke();
        
        // Mouth/Speaker Grill (sad downward curve)
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 2;
        const mouthY = height * 0.25;
        const mouthWidth = width * 0.3;
        ctx.beginPath();
        ctx.arc(0, mouthY + 5, mouthWidth / 2, Math.PI * 0.2, Math.PI * 0.8, true); // Sad curve
        ctx.stroke();

        // Legs (Simple rectangles)
        const legWidth = width * 0.2;
        const legHeight = height * 0.15;
        const legY = height / 2 - legHeight;
        const legSpacing = width * 0.1;

        ctx.fillStyle = darkColor;
        ctx.fillRect(-legSpacing - legWidth, legY, legWidth, legHeight);
        ctx.fillRect(legSpacing, legY, legWidth, legHeight);
        
        // Small blue panel
        ctx.fillStyle = accentColor;
        ctx.fillRect(-width * 0.4, -height * 0.4, width * 0.15, height * 0.1);

        ctx.restore(); // Restore context state
    }

}); 