
// FIRST ATTEMPT AT MAKING AN A* ALGO
//
// MADE BY: BLUE NOVA


//cols and rows dictate how big the size of the map will be times 10
const cols = 50;
const rows = 50;

// Cross Section is where the threshold of the perlin noise will be used to make walls
// essentially how many walls will be in the map (increases the chance of no solution)
// 0 = no walls // 1 = all walls
const perlin_Wall_Cross_Section = 0.35;

// the more this increases, the less "perlin" and more "random" the walls will be distributed
const perlinZoom = 0.2;

// start/end Vert/Hori are where the start/end points are placed on the vertical/horizontal (x/y) axies on the grid
// values between 0 and 1 // 0 = most left/up // 1 = most right/down
const startVert = 0;
const startHori = 0;
const endVert = 1;
const endHori = 1;

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        ///
// !!do not recommend changing anything below this line of code!! ONLY READ THE COMMENTS  ///
//                                                                                        ///
/////////////////////////////////////////////////////////////////////////////////////////////
//
//declaring global variables
let grid = new Array();
let openSet = [];
let closedSet = [];
let start;
let end;
let w, h;
let path = [];
var noiseI;

//making the class for one block or unit of distance on the map
class Spot {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = undefined;

    // sets the state of the spot to be default NOT a wall (changed later using the perlin itterator)
    this.wall = false;

    // this function will detect all the neighboring "spots", ignoring edges of maps (in other words, this is all the valid steps
    // a path can take, including diagonals) 
    this.addNeighbors = function (grid) {
      var i = this.i;
      var j = this.j;
      if (i < cols - 1) {
        this.neighbors.push(grid[i + 1][j]);
      }
      if (i > 0) {
        this.neighbors.push(grid[i - 1][j]);
      }
      if (j < rows - 1) {
        this.neighbors.push(grid[i][j + 1]);
      }
      if (j > 0) {
        this.neighbors.push(grid[i][j - 1]);
      }
      if (i > 0 && j > 0) {
        this.neighbors.push(grid[i - 1][j - 1]);
      }
      if (i < cols - 1 && j > 0) {
        this.neighbors.push(grid[i + 1][j - 1]);
      }
      if (i > 0 && j < rows - 1) {
        this.neighbors.push(grid[i - 1][j + 1]);
      }
      if (i < cols - 1 && j < rows - 1) {
        this.neighbors.push(grid[i + 1][j + 1]);
      }
    }

    // draws the spot on the map as a circle IF IT IS A WALL
    this.show = function (col) {
      //fill(col);
      if (this.wall) {
        fill(0);
        noStroke();
        // uncomment the rect fuction and comment the ellipse to change the way the walls are drawn (might screw with how 
        // the final path is drawn)
        ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 1.1, h / 1.1);
        //rect(this.i * w, this.j * h, w - 1, h - 1);
      }


    };
  }
}

function heuristic(a, b) {
  // commented use of mannhattan distance, switch to notice a slight difference of how the path moves
  var d = dist(a.i, a.j, b.i, b.j);
  //var d = abs(a.i - b.i) + abs(a.j - b.j);
  return d;
}

function removeFromArray(arr, elt) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

// main method
function setup() {
  createCanvas(cols * 10, rows * 10);

  //random point where the perlin noise starts
  noiseI = random(0, 1000);

  w = width / cols;
  h = height / rows;

  //creating the array for the grid map
  for (var i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  //filling the array with the spots
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j);
    }
  }

  //finding each spot's neighbors
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid)
    }
  }

  //chooses if the spot will be a wall or not
  var yoff = 0;
  for (var i = 0; i < cols; i++) {
    var xoff = 0;
    for (var j = 0; j < rows; j++) {
      if (noise(xoff, yoff) < perlin_Wall_Cross_Section) {
        grid[i][j].wall = true;
      }
      xoff += perlinZoom;
    }
    yoff += perlinZoom;
  }


  start = grid[floor(cols * startVert)][floor(rows * startHori)];
  end = grid[floor(cols * endVert) - 1][floor(rows * endHori) - 1];

  start.wall = false;
  end.wall = false;

  openSet.push(start);
}

// infinite loop/render frames
// actual A* algorithim (not alot of comments since i dont really know how it works 100% either)
function draw() {
  if (openSet.length > 0) {
    var lowestIndex = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f)
        lowestIndex = i;
    }
    var current = openSet[lowestIndex];

    if (openSet[lowestIndex] == end) {

      noLoop();
      console.log("DONE");
    }

    removeFromArray(openSet, current);
    closedSet.push(current);

    var neighbors = current.neighbors;
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        var tempG = current.g + 1;

        var newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }
        if (newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = current;
        }
      }

    }
  } else {
    console.log("no solution!");
    noLoop();
    return;

    // no solution
  }

  background(255);

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].show(color(225));
    }
  }

  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(255, 0, 0));
  }
  for (var i = 0; i < openSet.length; i++) {
    openSet[i].show(color(0, 255, 0));
  }

  path = [];
  var temp = current;
  path.push(temp);
  while (temp.previous) {
    path.push(temp.previous);
    temp = temp.previous;
  }

  noFill();
  stroke(75, 10, 255);
  strokeWeight(w / 2);
  beginShape();
  for (var i = 0; i < path.length; i++) {
    vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();
}