var canvas = document.getElementById('c'),
ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

var colors = ['cyan', 'magenta', 'yellow', 'green', 'red', 'blue'];

var state = {
    groups: [],

    restart: function() {
        this.groups = [];
        this.initialize();
    },

    initialize: function() {
        var numOfGroups = Math.floor(Math.random() * 8) + 2;
        for (var i=0; i<numOfGroups; i++) {
            var numPoints = Math.ceil(Math.random() * 10) + 4;
            var maxLineHistory = Math.ceil(Math.random() * 15) + 5;
            var color = colors[Math.floor(Math.random()*colors.length)];
            this.addGroup(numPoints, maxLineHistory, color);
        }
    },

    addGroup: function(numOfPoints, maxLineHistory, color) {
        var points = [];

        for (var i=0; i<numOfPoints; i++) {
            var x = Math.floor(Math.random() * window.innerWidth),
                y = Math.floor(Math.random() * window.innerHeight),
                t = Math.random() * Math.PI;
            points.push(new Point(x, y, Math.cos(t), Math.sin(t)));

            if (i>0)
                points[i-1].next = points[i];
        }
        points[numOfPoints-1].next = points[0];

        this.groups.push(new Group(points, maxLineHistory, color));
    }
};

function Point(x, y, dx, dy, next) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.next = next;
}

function Group(points, maxLineHistory, color) {
    this.points = points;
    this.history = [];
    this.maxLineHistory = maxLineHistory;
    this.color = color == null ? 'white' : color;

    this.update = function(newPoints) {
        this.history.push(deepCopy(this.points));
        this.points = newPoints;
        if (this.history.length > this.maxLineHistory)
            this.history.shift();
    }
}

function deepCopy(points) {
    var newPoints = [];
    points.forEach(function (pt) {
        newPoints.push(new Point(pt.x, pt.y, pt.dx, pt.dy));
    });
    for (var i=1; i < newPoints.length; i++)
        newPoints[i-1].next = newPoints[i];
    newPoints[newPoints.length-1].next = newPoints[0];
    return newPoints;
}

function drawLineGroup(group) {
    group.history.forEach(function(h) {
        h.forEach(function(pt) {
            ctx.strokeStyle = group.color;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.next.x, pt.next.y);
            ctx.lineWidth = '1';
            ctx.stroke();
        });
    });
}

function redraw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    state.groups.forEach(drawLineGroup);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();
}

function tic() {
    state.groups.forEach(function(group) {
        var newPoints = deepCopy(group.points);
        newPoints.forEach(function(pt) {
            pt.x += pt.dx * 10.0;
            pt.y += pt.dy * 10.0;
            if (pt.x > window.innerWidth) {
                pt.dx = -pt.dx;
                pt.x = window.innerWidth;
            }
            if (pt.x < 0) {
                pt.dx = -pt.dx;
                pt.x = 0;
            }
            if (pt.y > window.innerHeight) {
                pt.dy = -pt.dy;
                pt.y = window.innerHeight;
            }
            if (pt.y < 0) {
                pt.dy = -pt.dy;
                pt.y = 0;
            }
        });
        group.update(newPoints);
    })
}

setInterval(function() {
    tic();
    redraw();
}, 100);

window.addEventListener('resize', resizeCanvas, false);
canvas.addEventListener('click', state.restart.bind(state), false);
resizeCanvas();
state.initialize();
