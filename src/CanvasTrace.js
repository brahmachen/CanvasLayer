function CanvasTrace(options) {
    this.options = options || {};
    this.trace = this.options.data;
    this._map = this.options.map;
    this.options.yushu = 0;
    this.draw();
}

CanvasTrace.prototype.draw = function() {
    var canvasLayer = new CanvasLayer({
        map: this._map,
        update: update(this.options)
    })
    var options = this.options;
    if (this.options.showAnimation) {
        setInterval(function() {
            options.yushu += 1;
            options.yushu %= 5;
            canvasLayer.draw();
        }, 200)
    }
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
        if (!options.showArrow) return;
        // 去重后的像素点
        var pixelNoRepeat = [];
        var pre = pixelArr[0];
        for (var i in pixelArr) {
            var item = pixelArr[i];
            if (i == 0) continue;
            var distance = Math.sqrt(Math.pow(Math.abs(pre.x - item.x), 2) +
                Math.pow(Math.abs(pre.y - item.y), 2));
            if (distance >= 10) {
                pixelNoRepeat.push({
                    position: pre,
                    distance: distance.toFixed(2)
                })
                pre = item;
            }
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
            var angle = positionToAngle(item.position, next.position);
            item.position.angle = angle;
            pixelInterpo.push(item.position);
            for (var j = 0; j < (item.distance / 20); j++) {
                pixelInterpo.push({
                    x: item.position.x + xstep * j,
                    y: item.position.y + ystep * j,
                    angle: angle
                })
            }
        }
        ctx.fillStyle = "white";
        ctx.beginPath();
        for (var i in pixelInterpo) {
            if ((Number(i) + 1) % 5 !== options.yushu) continue;
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
            ctx.restore();
        }
    }
}
// 根据坐标计算与x轴正方向的夹角
function positionToAngle(p1, p2) {
    if (p1.x == p2.x && p1.y == p2.y) return 0;
    if (p1.x == p2.x) return p2.y > p1.y ? Math.PI : Math.PI * 2;
    var angle = Math.atan((p2.y - p1.y) / (p2.x - p1.x));
    if (p2.x >= p1.x) return angle + Math.PI / 2;
    if (p2.x < p1.x) return angle + Math.PI / 2 * 3;
}

/**
 * 一直覆盖在当前地图视野的Canvas对象
 *
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 *
 * @param 
 * {
 *     map 地图实例对象
 * }
 */

function CanvasLayer(options) {
    this.options = options || {};
    this.paneName = this.options.paneName || 'labelPane';
    this.zIndex = this.options.zIndex || 0;
    this._map = options.map;
    this._lastDrawTime = null;
    this.show();
}

CanvasLayer.prototype = new BMap.Overlay();

CanvasLayer.prototype.initialize = function(map) {
    this._map = map;
    let canvas = this.canvas = document.createElement("canvas");
    let ctx = this.ctx = this.canvas.getContext('2d');
    canvas.style.cssText = "position:absolute;" +
        "left:0;" +
        "top:0;" +
        "z-index:" + this.zIndex + ";";
    this.adjustSize();
    this.adjustRatio(ctx);
    map.getPanes()[this.paneName].appendChild(canvas);
    let that = this;
    map.addEventListener('resize', function() {
        that.adjustSize();
        that._draw();
    });
    return this.canvas;
}

CanvasLayer.prototype.adjustSize = function() {
    let size = this._map.getSize();
    let canvas = this.canvas;
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
}

CanvasLayer.prototype.adjustRatio = function(ctx) {
    let backingStore = ctx.backingStorePixelRatio ||
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;
    let pixelRatio = (window.devicePixelRatio || 1) / backingStore;
    let canvasWidth = ctx.canvas.width;
    let canvasHeight = ctx.canvas.height;
    ctx.canvas.width = canvasWidth * pixelRatio;
    ctx.canvas.height = canvasHeight * pixelRatio;
    ctx.canvas.style.width = canvasWidth + 'px';
    ctx.canvas.style.height = canvasHeight + 'px';
    console.log(ctx.canvas.height, canvasHeight);
    ctx.scale(pixelRatio, pixelRatio);
};

CanvasLayer.prototype.draw = function() {
    let self = this;
    let args = arguments;

    clearTimeout(self.timeoutID);
    self.timeoutID = setTimeout(function() {
        self._draw.apply(self, args);
    }, 15);
}

CanvasLayer.prototype._draw = function() {
    let map = this._map;
    this.canvas.style.left = -map.offsetX + 'px';
    this.canvas.style.top = -map.offsetY + 'px';
    this.dispatchEvent('draw');
    this.options.update && this.options.update.apply(this, arguments);
}

CanvasLayer.prototype.getContainer = function() {
    return this.canvas;
}

CanvasLayer.prototype.show = function() {
    if (!this.canvas) {
        this._map.addOverlay(this);
    }
    this.canvas.style.display = "block";
}

CanvasLayer.prototype.hide = function() {
    this.canvas.style.display = "none";
    //this._map.removeOverlay(this);
}

CanvasLayer.prototype.setZIndex = function(zIndex) {
    this.canvas.style.zIndex = zIndex;
}

CanvasLayer.prototype.getZIndex = function() {
    return this.zIndex;
}