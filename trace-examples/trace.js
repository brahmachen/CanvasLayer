/**
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 */

// 创建Map实例
var map1 = new BMap.Map("map");

map1.centerAndZoom(new BMap.Point(116.405706, 39.927773), 12); // 初始化地图,设置中心点坐标和地图级别
map1.enableScrollWheelZoom(); //启用滚轮放大缩小

var canvasTrace = new CanvasTrace({
    data: traceArr,
    map: map1,
    color: "red",
    width: 7
})
map1.setViewport([traceArr[0],
    traceArr[traceArr.length - 1]
])
map1.zoomOut();