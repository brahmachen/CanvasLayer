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
        console.log(JSON.stringify(pixelArr, null, '\t'));
        for (var i in pixelArr) {
            var item = pixelArr[i];
            if (i == 0) continue;
            var pre = pixelArr[i - 1];
            var distance = Math.sqrt(Math.pow(Math.abs(pre.x - item.x), 2) +
                Math.pow(Math.abs(pre.y - item.y), 2));
            console.log(distance);
        }
        // 根据距离算出两个点之间需要插入几个点
        // 然后插值让点均匀分布
        // 最后截取出需要显示方向箭头的位置数组
        // 画方向箭头，注意方向
    }
}