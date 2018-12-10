
import { Events, Vector3, Box3, _Math, Matrix4,Vector2 } from "mmgl/src/index";
import { _ } from 'mmvis/src/index';


//默认坐标系的中心点与坐标系的原点都为世界坐标的[0,0,0]点
//惯性坐标系
class InertialSystem extends Events {
    constructor(root) {
        super();

        this._root = root;
        this.coord = {};

        //坐标原点
        this.origin = new Vector3(0, 0, 0);
        //中心的
        this.center = new Vector3(0, 0, 0);

        this.boundbox = new Box3();
        this.size = new Vector3();
        this.baseBoundbox = new Box3();
        this.padding = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            front: 0,
            back: 0
        }




        this.fieldMap = {};
        this.group = root.app.addGroup({ name: 'InertialSystem' });
        _.extend(true, this, this.setDefaultOpts(root.opt));

    }

    setDefaultOpts(opts) {
        return opts;
    }

    getColor(field) {
        return this.fieldMap[field] && this.fieldMap[field].color;
    }

    getBoundbox() {

        let _boundbox = new Box3();

        let _opt = this._root.opt.coord.controls;
        let _frustumSize = this._root.renderView.mode == 'ortho' ? _opt.boxHeight * 0.8 : _opt.boxHeight;
        let _width = _opt.boxWidth;
        let _depth = _opt.boxDepth;

        //斜边
        let _hypotenuse = _opt.distance || (new Vector3(_width, 0, _depth)).length();

        let _ratio = this._root.renderView.getVisableSize(new Vector3(0, 0, -_hypotenuse)).ratio;

        let minX = - _width * 0.5 + this.padding.left * _ratio;
        let minY = - _frustumSize * 0.5 + this.padding.bottom * _ratio;
        let minZ = this.padding.front - _hypotenuse * 0.5 - _depth;

        let maxX = _width * 0.5 - this.padding.right * _ratio;
        let maxY = _frustumSize * 0.5 - this.padding.top * _ratio;
        let maxZ = - _hypotenuse * 0.5 + this.padding.back;

        _boundbox.min.set(minX, minY, minZ);
        _boundbox.max.set(maxX, maxY, maxZ);

        this.baseBoundbox = _boundbox
        return _boundbox;
    }

    _getWorldPos(pos) {
        let posWorld = pos.clone();

        this.group.updateMatrixWorld();
        posWorld.applyMatrix4(this.group.matrixWorld);
        return posWorld;
    }

    getSize() {
        if (this.boundbox) {
            this.size = this.boundbox.getSize();
        }
        return this.size;
    }

    dataToPoint(data, dir) {

    }


    pointToData() {

    }

    initCoordUI() {
        //什么都不做
        return null;
    }
    drawUI() {
        // this._root.initComponent();
    }

    draw() {
        this._root.draw();
    }
    dispose() {

    }
    resetData() {

    }

    getAxisDataFrame(fields) {
        let dataFrame = this._root.dataFrame;

        return dataFrame.getDataOrg(fields, function (val) {
            if (val === undefined || val === null || val == "") {
                return val;
            }
            return (isNaN(Number(val)) ? val : Number(val))
        })

    }
    positionToScreen(pos) {
        return positionToScreen.call(this, pos);
    }
    screenToWorld(dx, dy) {
        return screenToWorld.call(this, dx, dy);
    }

}


let positionToScreen = (function () {
    let matrix = new Matrix4();

    return function (pos) {
        let pCam = this._root.renderView._camera;
        const widthHalf = 0.5 * this._root.width;
        const heightHalf = 0.5 * this._root.height;

        let target = this.group.localToWorld(pos);

        target.project(pCam, matrix);

        target.x = (target.x * widthHalf) + widthHalf;
        target.y = (- (target.y * heightHalf) + heightHalf);
        return target;
    }
})();



let screenToWorld = (function () {
    let matrix = new Matrix4();

    return function (dx, dy) {
        let pCam = this._root.renderView._camera;
        const width = this._root.width;
        const height = this._root.height;
        let mouse = new Vector2();

        mouse.x = (dx / width) * 2 - 1;
        mouse.y = -(dy / height) * 2 + 1;
        //新建一个三维单位向量 假设z方向就是0.5
        //根据照相机，把这个向量转换到视点坐标系

        var target = new Vector3(mouse.x, mouse.y, 0.5).unproject(pCam, matrix);

        // let target = this.group.localToWorld(pos);

        // target.project(pCam, matrix);

        // target.x = (target.x * widthHalf) + widthHalf;
        // target.y = (- (target.y * heightHalf) + heightHalf);
         return target;
    }
})();

export { InertialSystem };