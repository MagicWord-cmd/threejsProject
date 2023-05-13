/* 
之前，我们一直使用相机控制器control来实现一些相关操作。
比如是：OrbitControls.js，大家普遍都喜欢使用的一种控制器。
这种控制器有两个方法：getPolarAngle 和 getAzimuthalAngle
来获取相机相对于焦点沿y轴旋转的角度（水平角度）和沿x轴旋转的角度（垂直角度），
默认焦点位置是世界坐标的原点（可以额外设置control.target.set()）。
通过调用getPolarAngle()，我们们能够获得一个从0到Math.PI的弧度的值，
代表垂直角度0到180度。而调用getAzimuthalAngle()，我们能够获取到
一个-Math.PI到Math.PI范围内的一个值，代表可以水平旋转的角度从z轴正轴顺时针0到360度一周。
但是，这个控制器却缺少一个可以通过函数设置相机朝向以及位置的方法，所以我就自己手动实现了一个。
代码如下，需要放到OrbitControls.js代码的构造函数内：
*/
this.setAngle = function (phi, theta, distance) {
    var r = distance || scope.object.position.distanceTo(scope.target);
    var x = r * Math.cos(phi - Math.PI / 2) * Math.sin(theta) + scope.target.x;
    var y = r * Math.sin(phi + Math.PI / 2) + scope.target.y;
    var z = r * Math.cos(phi - Math.PI / 2) * Math.cos(theta) + scope.target.z; scope.object.position.set(x, y, z);
    scope.object.lookAt(scope.target);
};

/* 
这个方法也可以设置与相机的距离，如果没有设置的话，就获取当前相机距离控制器焦点的位置。

然后通过相机的水平转动和垂直转动求出当前相机所在的位置。
最后再让相机朝向焦点。

现在还无法确定是否能合并到three.js源码当中，如果不能的话，可以在实例化后给对象增加方法：
*/

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.setAngle = function (phi, theta, distance) {
    var r = distance || controls.object.position.distanceTo(controls.target);
    var x = r * Math.cos(phi - Math.PI / 2) * Math.sin(theta) + controls.target.x;
    var y = r * Math.sin(phi + Math.PI / 2) + controls.target.y;
    var z = r * Math.cos(phi - Math.PI / 2) * Math.cos(theta) + controls.target.z;
    controls.object.position.set(x, y, z);
    controls.object.lookAt(controls.target);
};