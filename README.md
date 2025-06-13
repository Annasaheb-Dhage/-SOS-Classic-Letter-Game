#  SOS Classic Letter Game Documentation
  # SOS Classic Letter Game
 Prepared by team B-12  
* Netlify live link :  https://sos-classic-letter-game.netlify.app/
* github page : 
* Team Members :  
    * Magar Sakshi (magarsakshi87@hmail.com)  
    * Dhage Annasaheb (annasahebdhagepatil@gamil.com)  
    * Kakade Ashwini (kakadeashwini306@gamil.com)  
    * Navathar Vaishnavi  (vaishunavathar@gmail.com)  
    * Pacharne Shubhangi ( pacharneshubhangi8@gmail.com)  
 
 
* Introduction :
    * The SOS game is a classic two-player paper-and-pencil game played in a grid. Players take turns writing either an "S" or an "O" in an empty square. he goal is to be the first to complete the sequence “SOS” in a straight line—horizontally, vertically. This digital version of the game brings the fun and strategy of SOS to screens with added features like score tracking and dynamic UI.

* Objective  
  * The primary objective of the Sos Game project is to develop a user-friendly.
  * Provide an interactive and entertaining platform for users to play the SOS game.
  * Develop logic and decision-making skills through strategic gameplay.
* Technology Used  
    * HTML – Structure of the game interface
    * CSS – Styling and layout of the game
    * JavaScript – Game logic and interactivity




* Features
    * Two-player turn-based gameplay
    * Option to choose between "S" or "O"
    *  Score tracking for each player
    * Game ends when the grid is full
    * Simple, intuitive user interface
    *  Display of winner or draw 

* Project Workflow  
  * Start Game
  * Initialize grid (e.g., 3x3, 5x5)
  * Set scores to 0
  * Assign Player 1 to start
  * Display Empty Grid
  * All cells are blank
  * Scoreboard and turn indicator shown
  * Player Turn Begins
  * Current player selects a cell
  * Player chooses either “S” or “O”
  * Validate Move
  * Check if the selected cell is empty
  * If not: show error, ask for a different move
  * Place Letter
  * Insert the chosen letter into the grid
  * Check for “SOS”
  * Check in 8 directions from the placed letter
  * If “SOS” found:
      * Increase current player's score
      * (Optional) Allow extra turn
  * Check Game End Condition
  * Is the grid full?
      * Yes: Go to step 9
      * No: Continue
  * Switch Turn
  * Change current player
  * Go back to Step 3
  * Game Over
  * Display final scores
  * Declare winner or draw
  * Offer “Play Again” option
* Game Rules
  * The game is played on an N×N grid (usually 3x3 or 5x5).
  * Players take turns placing either "S" or "O".
  * A point is scored when a player completes an "SOS".
  * After scoring, the player gets an extra turn.
  * The game ends when all boxes are filled.
  * The player with the most points wins.

* Conclusion  
  * This SOS GAME project demonstrates how simple game logic can be implemented using programming. It serves as a great beginner-level project to understand concepts like 2D arrays, event handling, and turn-based logic. 
