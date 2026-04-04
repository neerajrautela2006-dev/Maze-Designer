# Path Maze Solver

An interactive maze solving visualization tool that helps you create and solve custom mazes using a depth-first search algorithm.

## Features

- Dynamic grid generation with customizable rows and columns
- Interactive maze creation:
  - Left-click to add/remove obstacles (black cells)
  - Spacebar to set start point (red cell) and end point (green cell)
- Animated path finding visualization (blue cells)
- Clean and modern UI with gradient background
- Responsive design that works across different screen sizes

## How to Use

1. Enter the desired number of rows and columns (default is 4x4)
2. Click "Generate Grid" to create a new maze
3. Create your maze:
   - Left-click on cells to add or remove obstacles (walls)
   - Press spacebar while hovering over a cell to set the start point (first click)
   - Press spacebar again to set the end point (second click)
4. Click "Solve Maze" to find and animate the path from start to end

## Technical Implementation

- Built with pure HTML, CSS, and JavaScript
- Uses HTML5 Canvas for grid rendering
- Implements depth-first search algorithm for pathfinding
- Features smooth animations for path visualization
- Modernized UI with glassmorphism effects

## Setup

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Start creating and solving mazes!

## Browser Compatibility

Works best in modern browsers that support:
- HTML5 Canvas
- CSS Grid
- CSS Backdrop Filter
- ES6 JavaScript
