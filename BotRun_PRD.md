# Product Requirements Document: BotRun

**1. Introduction**

*   **1.1. Project Goal:** To create a simple, engaging, and visually appealing infinite runner game using HTML5 Canvas.
*   **1.2. Target Audience:** Casual gamers looking for a quick and fun browser-based game experience.

**2. Core Gameplay**

*   **2.1. Genre:** Infinite Runner.
*   **2.2. Objective:** Control the player character (Bot) to avoid obstacles for as long as possible and achieve the highest score.
*   **2.3. Player Control:** The player character can jump to avoid obstacles. A single input (e.g., spacebar or mouse click/touch) will trigger the jump.
*   **2.4. Game Over:** The game ends when the player character collides with an obstacle.

**3. Player Character (Bot)**

*   **3.1. Appearance:** A simple geometric shape (e.g., a rounded rectangle or square) with "cute eyes" prominently displayed. The eyes could animate slightly (e.g., blinking).
*   **3.2. Movement:** The Bot remains in a fixed horizontal position on the screen while the environment scrolls past it. It can move vertically when jumping.
*   **3.3. Physics:** Basic jump physics (ascend and descend).

**4. Environment**

*   **4.1. Background:** A continuously scrolling background depicting a "beautiful dreamy" scene. This should include moving clouds.
*   **4.2. Background Progression:** The background visuals (e.g., color palette, cloud density, time of day) should subtly change as the game progresses (based on time or score) to indicate increasing difficulty or passage of time.
*   **4.3. Ground:** A distinct ground layer upon which the player runs and obstacles appear.

**5. Obstacles**

*   **5.1. Appearance:** Simple geometric shapes (e.g., rectangles, triangles) that contrast with the ground/background.
*   **5.2. Spawning:** Obstacles appear from the right side of the screen and move leftwards.
*   **5.3. Placement:** The distance between consecutive obstacles should be randomized within a certain range to ensure varied gameplay.
*   **5.4. Collision:** The game must detect collisions between the player character and obstacles.

**6. Game Progression & Difficulty**

*   **6.1. Speed:** The speed at which the environment and obstacles scroll should gradually increase over time, making the game progressively harder.
*   **6.2. Score:** The score increases based on the time survived or distance covered.

**7. User Interface (UI)**

*   **7.1. Start Screen:** Simple screen with the game title ("BotRun"), a prompt for the player's name (input field), and a "Start Game" button.
*   **7.2. In-Game UI:** Display the current score continuously during gameplay.
*   **7.3. Game Over Screen:** Displays "Game Over", the player's final score, and the Top 3 high scores (with names). Include a "Play Again" button.
*   **7.4. High Score Display:** Show the top 3 scores (Name: Score) persistently.

**8. Technical Specifications**

*   **8.1. Platform:** Web Browser (Desktop primarily, mobile responsiveness is a plus).
*   **8.2. Technology:** HTML5 Canvas API, JavaScript (ES6+), CSS3 for styling non-canvas elements.
*   **8.3. Rendering:** Use the 2D context of the HTML5 Canvas for all game graphics.

**9. Data Persistence**

*   **9.1. High Scores:** Top 3 high scores (including player names) should be saved locally in the user's browser using `localStorage`.

**10. Non-functional Requirements**

*   **10.1. Performance:** Smooth animation and responsive controls (target 60 FPS).
*   **10.2. Compatibility:** Should run on major modern web browsers (Chrome, Firefox, Safari, Edge).
*   **10.3. Code Quality:** Well-structured, commented (where necessary), and maintainable JavaScript code. 