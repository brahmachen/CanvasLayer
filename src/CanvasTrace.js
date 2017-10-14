function CanvasTrace(options) {
    this.options = options || {};
    this.trace = this.options.data;
    this._map = this.options.map;
    this.draw();
}

CanvasTrace.prototype.draw = function() {
    var canvasLayer = new CanvasLayer({
        map: this._map,
        update: update(this.options)
    })
}

function update(options) {
    var _map = options.map;
    var _trace = options.data;
    return function() {
        var ctx = this.canvas.getContext("2d");
        if (!ctx) {
            return;
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.strokeStyle = "white";
        // ctx.globalAlpha = 0.7;
        ctx.lineWidth = options.width ? options.width * 1.5 : 9;
        ctx.lineCap = "round";
        ctx.beginPath();
        var p1 = _map.pointToPixel(_trace[0]);
        ctx.moveTo(p1.x, p1.y);
        for (var i = 0, len = _trace.length; i < len; i++) {
            var pixel = _map.pointToPixel(_trace[i]);
            ctx.lineTo(pixel.x, pixel.y);
        }
        ctx.stroke();

        ctx.strokeStyle = options.color || "rgba(50, 50, 255, 0.7)";
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = options.width || 6;
        ctx.lineCap = "round";
        ctx.beginPath();
        var p1 = _map.pointToPixel(_trace[0]);
        ctx.moveTo(p1.x, p1.y);
        var pixelArr = [];
        for (var i = 0, len = _trace.length; i < len; i++) {
            var pixel = _map.pointToPixel(_trace[i]);
            pixelArr.push(pixel);
            ctx.lineTo(pixel.x, pixel.y);
        }
        ctx.stroke();

        // 轨迹上的方向箭头
        // 像素点插值
        // console.log(JSON.stringify(pixelArr, null, '\t'));
        // 去重后的像素点
        var pixelNoRepeat = [];
        var pre = pixelArr[0];
        for (var i in pixelArr) {
            var item = pixelArr[i];
            if (i == 0) continue;
            // var next = pixelArr[Number(i) + 1];
            var distance = Math.sqrt(Math.pow(Math.abs(pre.x - item.x), 2) +
                Math.pow(Math.abs(pre.y - item.y), 2));
            if (distance >= 10) {
                pixelNoRepeat.push({
                    position: pre,
                    distance: distance.toFixed(2)
                })
                pre = item;
            }
            // console.log(distance);
        }
        pixelNoRepeat.push({
            position: pixelArr[pixelArr.length - 1]
        });
        // 插值后的像素点
        var pixelInterpo = [];
        for (var i in pixelNoRepeat) {
            var item = pixelNoRepeat[i];
            if (i == (pixelNoRepeat.length - 1)) break;
            if (item.x < 0 || item.x > ctx.canvas.width ||
                item.y < 0 || item.y > ctx.canvas.height)
                continue;
            // 根据距离算出两个点之间需要插入几个点
            // if (item.distance < 1) continue;
            var next = pixelNoRepeat[Number(i) + 1];
            var xstep = (next.position.x - item.position.x) / (item.distance / 20);
            var ystep = (next.position.y - item.position.y) / (item.distance / 20);
            var angle = Math.atan((next.position.x - item.position.x) / (next.position.y - item.position.y));
            // pixelInterpo.push(item.position);
            for (var j = 0; j < (item.distance / 20); j++) {
                pixelInterpo.push({
                    x: item.position.x + xstep * j,
                    y: item.position.y + ystep * j,
                    angle: -angle
                })
            }
        }
        ctx.fillStyle = "white"
        ctx.beginPath();
        for (var i in pixelInterpo) {
            if (i % 3 !== 0) continue;
            var item = pixelInterpo[i];
            ctx.save();
            ctx.strokeStyle = "white";
            ctx.lineWidth = options.width / 4;
            ctx.translate(item.x, item.y);
            ctx.rotate(item.angle);
            var marlength = options.width / 2;
            ctx.moveTo(-marlength, marlength);
            ctx.lineTo(0, 0);
            ctx.lineTo(marlength, marlength);
            ctx.stroke();
            // ctx.arc(0, 0, 1, 0, 2 * Math.PI);
            ctx.restore();
        }
        // console.log(JSON.stringify(pixelInterpo, null, '\t'));
    }
}