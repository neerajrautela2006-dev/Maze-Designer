document.addEventListener('DOMContentLoaded', function() {
  let rows = 8;
  let cols = 8;
  let grid = [];
  let userPath = [];
  let allowUserPath = true;
  let currentObstacle = '💀';

  const mazeDiv = document.getElementById('maze');
  const popup = document.getElementById('popup');
  const nomSound = document.getElementById('nomSound');
  const obstacleSelect = document.getElementById('obstacle-emoji');
  const generateBtn = document.getElementById('generate-btn');
  const pathBtn = document.getElementById('path-btn');
  const runBtn = document.getElementById('run-btn');
  const clearBtn = document.getElementById('clear-btn');
  const closePopupBtn = document.getElementById('close-popup');

  generateBtn.addEventListener('click', generateEmptyMaze);
  pathBtn.addEventListener('click', startUserPath);
  runBtn.addEventListener('click', runMaze);
  clearBtn.addEventListener('click', clearPath);
  closePopupBtn.addEventListener('click', closePopup);
  obstacleSelect.addEventListener('change', function() {
    currentObstacle = this.value;
    updateObstacleEmojis();
  });

  function generateEmptyMaze() {
    rows = parseInt(document.getElementById('rows').value) || 8;
    cols = parseInt(document.getElementById('cols').value) || 8;

    if (rows < 3) rows = 3;
    if (rows > 20) rows = 20;
    if (cols < 3) cols = 3;
    if (cols > 20) cols = 20;

    document.getElementById('rows').value = rows;
    document.getElementById('cols').value = cols;

    mazeDiv.innerHTML = '';
    grid = [];
    userPath = [];
    allowUserPath = true;

    mazeDiv.style.gridTemplateColumns = `repeat(${cols}, minmax(30px, 50px))`;
    mazeDiv.style.gridTemplateRows = `repeat(${rows}, minmax(30px, 50px))`;

    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = i;
        cell.dataset.col = j;

        const isStart = i === 0 && j === 0;
        const isEnd = i === rows - 1 && j === cols - 1;

        if (isStart) cell.innerHTML = '🐭';
        else if (isEnd) cell.innerHTML = '🧀';

        cell.addEventListener('click', () => toggleObstacle(i, j, cell));
        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          if (allowUserPath && !grid[i][j].isObstacle) {
            if (!cell.classList.contains('user-path')) {
              cell.classList.add('user-path');
              userPath.push([i, j]);
            } else {
              cell.classList.remove('user-path');
              userPath = userPath.filter(p => !(p[0] === i && p[1] === j));
            }
          }
        });

        grid[i][j] = { element: cell, isObstacle: false };
        mazeDiv.appendChild(cell);
      }
    }
  }

  function toggleObstacle(i, j, cell) {
    const isStart = i === 0 && j === 0;
    const isEnd = i === rows - 1 && j === cols - 1;
    if (isStart || isEnd) return;

    grid[i][j].isObstacle = !grid[i][j].isObstacle;
    if (grid[i][j].isObstacle) {
      cell.classList.add('wall');
      cell.innerHTML = currentObstacle;
    } else {
      cell.classList.remove('wall');
      cell.innerHTML = '';
    }
  }

  function updateObstacleEmojis() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i] && grid[i][j] && grid[i][j].isObstacle) {
          grid[i][j].element.innerHTML = currentObstacle;
        }
      }
    }
  }

  function buildUserPathMap() {
    const pathMap = Array.from({ length: rows }, () => Array(cols).fill(false));
    userPath.forEach(([r, c]) => {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        pathMap[r][c] = true;
      }
    });
    pathMap[0][0] = true;
    pathMap[rows - 1][cols - 1] = true;
    return pathMap;
  }

  function validateUserPath() {
    if (userPath.length === 0) return false;

    const pathMap = buildUserPathMap();
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [[0, 0]];
    visited[0][0] = true;

    while (queue.length) {
      const [r, c] = queue.shift();
      if (r === rows - 1 && c === cols - 1) return true;

      const neighbors = [
        [r + 1, c],
        [r - 1, c],
        [r, c + 1],
        [r, c - 1],
      ];

      for (const [nr, nc] of neighbors) {
        if (
          nr >= 0 && nr < rows &&
          nc >= 0 && nc < cols &&
          !visited[nr][nc] &&
          pathMap[nr][nc] &&
          !grid[nr][nc].isObstacle
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }

    return false;
  }

  function clearPath() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i] && grid[i][j]) {
          grid[i][j].element.classList.remove(
            'user-path',
            'path',
            'solution-path',
            'visited'
          );
          const isStart = i === 0 && j === 0;
          const isEnd = i === rows - 1 && j === cols - 1;
          if (isStart) grid[i][j].element.innerHTML = '🐭';
          else if (isEnd) grid[i][j].element.innerHTML = '🧀';
          else if (!grid[i][j].isObstacle) grid[i][j].element.innerHTML = '';
          else grid[i][j].element.innerHTML = currentObstacle;
        }
      }
    }
    userPath = [];
    allowUserPath = true;
  }

  function startUserPath() {
    if (userPath.length === 0) {
      alert('Right-click a series of cells from the mouse to the cheese, then click Try My Path again.');
      allowUserPath = true;
      return;
    }

    allowUserPath = false;

    if (validateUserPath()) {
      showPopup();
      nomSound.play();
    } else {
      alert('The path you marked is not valid. Make sure all selected cells form a connected route from the start to the end without obstacles.');
      allowUserPath = true;
    }
  }

  function runMaze() {
    allowUserPath = false;
    clearPath();

    const solution = [];
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

    function isSafe(r, c) {
      return r >= 0 && r < rows && c >= 0 && c < cols && !grid[r][c].isObstacle;
    }

    function solveMaze(r, c) {
      if (r === rows - 1 && c === cols - 1) {
        solution.push([r, c]);
        return true;
      }

      if (isSafe(r, c) && !visited[r][c]) {
        visited[r][c] = true;
        solution.push([r, c]);
        grid[r][c].element.classList.add('path');

        // Move Right
        if (solveMaze(r, c + 1)) return true;

        // Move Down
        if (solveMaze(r + 1, c)) return true;

        // Move Left
        if (solveMaze(r, c - 1)) return true;

        // Move Up
        if (solveMaze(r - 1, c)) return true;

        // Backtrack
        solution.pop();
        grid[r][c].element.classList.remove('path');
        return false;
      }
      return false;
    }

    if (solveMaze(0, 0)) {
      // Mark the solution path visually
      solution.forEach(([r, c]) => {
        if (!(r === 0 && c === 0) && !(r === rows - 1 && c === cols - 1)) {
          grid[r][c].element.classList.add('solution-path');
        }
      });
      showPopup();
      nomSound.play();
    } else {
      alert("No path found!");
    }
  }

  function showPopup() {
    popup.classList.remove('hidden');
  }

  function closePopup() {
    popup.classList.add('hidden');
  } 

  // Initialize maze on page load
  generateEmptyMaze();
});
