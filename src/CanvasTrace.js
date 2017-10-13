function CanvasTrace(options) {
    this.options = options || {};
    this.trace = this.options.data;
    this._map = this.options.map;
    this.draw();
}

CanvasTrace.prototype.draw = function() {
    var canvasLayer = new CanvasLayer({
        map: this._map,
        update: update(this.trace)
    })
}

function update(data) {
    return function() {
        var ctx = this.canvas.getContext("2d");
        if (!ctx) {
            return;
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "rgba(50, 50, 255, 0.7)";
        ctx.beginPath();
        var p1 = map.pointToPixel(data[0]);
        ctx.moveTo(p1.x, p1.y);
        for (var i = 0, len = data.length; i < len; i++) {
            var pixel = map.pointToPixel(data[i]);
            ctx.lineTo(pixel.x, pixel.y);
        }
        ctx.stroke();
    }
}