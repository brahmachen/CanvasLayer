/**
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 */

// 创建Map实例
var map = new BMap.Map("map");

map.centerAndZoom(new BMap.Point(116.405706, 39.927773), 12); // 初始化地图,设置中心点坐标和地图级别
map.enableScrollWheelZoom(); //启用滚轮放大缩小

var canvasTrace = new CanvasTrace({
    data: traceArr,
    map: map
})