//"use strict";
window.a = 0;
var paopao = {
    positions:[],
    stage: new PIXI.Container(),
    graphics : new PIXI.Graphics(),
    renderer: null,
    baseWith: function () { var t = parseInt(document.documentElement.clientWidth / 5); return t > 100 ? 100 : t; }(),
    radius:0,
    width: 0,
    height: 0,
    translate: { x: 0, y: 0 },
    dom: null,
    curGlass: null,
    eventval: {
        touchstart: false,
        clientX: 0,
        clientY: 0,
        curPPao:null
    }
};
paopao.start = function (control) {
    var stage = paopao.stage,
        graphics = paopao.graphics,
        renderer = null;

    paopao.dom = control;
    paopao.width = control.offsetWidth * 3;
    paopao.height = control.offsetHeight * 3;
    paopao.radius = this.baseWith * 0.7;

    renderer = paopao.renderer = PIXI.autoDetectRenderer(paopao.width, paopao.height, { backgroundColor: 0x26143E, antialias: true });
    //互动  事件开启
    stage.interactive = true;
    graphics.interactive = true;

    control.appendChild(renderer.view);

    this.setCanvanPosition(renderer.view);

    paopao.init();

    stage.addChild(graphics);

    

    animate();
    function animate() {
        

        renderer.render(stage);
        paopao.curGlass.changePao();

        requestAnimationFrame(animate);
    }
}

paopao.init = function () {
    var self = this;
    //生成泡泡
    this.positions = this.createPosition(function (position) {
        //循环回调,生产泡泡,颜色随机
        var r = Math.random(),
            color = r < 0.8 ? r < 0.6 ? r < 0.4 ? r < 0.2 ? 'yellow' : 'blue' : 'red' : 'cyanblue' : 'gray';
        position.ppao = new ppao(position.x, position.y, color);
        
    });
    //生成扩大镜
    this.createGlass(this.positions);
    this.event();
}
paopao.event = function () {
    var self = this;
    this.dom.addEventListener('mousedown', function (e) {
        self.setDomMousedown(e);
    });
    this.dom.addEventListener('touchstart', function (e) {
        self.setDomMousedown(e);
    });

    this.dom.addEventListener('mouseup', function (e) {
        self.setDomMouseup(e);
    });
    this.dom.addEventListener('touchend', function (e) {
        self.setDomMouseup(e);
    });

    this.dom.addEventListener('mousemove', function (e) {
        if (self.touchstart) {
            self.setDomMousemove(e);
        }
    });
    this.dom.addEventListener('touchmove', function (e) {
        if (self.touchstart) {
            self.setDomMousemove(e);
        }

    });
    this.graphics.on('mousedown', function (e) {
        self.setGraphMousedown(e);
    });
    this.graphics.on('touchstart', function (e) {
        self.setGraphMousedown(e);
    });
    this.graphics.on('mouseup', function (e) {
        self.setGraphMouseup(e);
    });
    this.graphics.on('touchend', function (e) {
        self.setGraphMouseup(e);
    });
}
paopao.setDomMousedown = function (e) {
    this.touchstart = true;
    this.eventval.clientX = e.clientX;
    this.eventval.clientY = e.clientY;
}
paopao.setDomMouseup = function (e) {
    this.touchstart = false;
}
paopao.setDomMousemove = function (e) {
    var p = {
        x: this.eventval.clientX - e.clientX,
        y: this.eventval.clientY - e.clientY
    }
    this.eventval.clientX = e.clientX;
    this.eventval.clientY = e.clientY;

    var tmpX = this.translate.x - p.x;
    var tmpY = this.translate.y - p.y;
    if (tmpX > this.translate.maxX) {
        tmpX = this.translate.maxX;
    }
    if (tmpX < this.translate.minX) {
        tmpX = this.translate.minX;
    }
    if (tmpY > this.translate.maxY) {
        tmpY = this.translate.maxY;
    }
    if (tmpY < this.translate.minY) {
        tmpY = this.translate.minY;
    }

    this.translate.x = tmpX;
    this.translate.y = tmpY;
    
    this.renderer.view.style.transform = 'translate(' + this.translate.x.toString() + 'px,' + this.translate.y.toString() + 'px)';
    this.renderer.view.style.webkitTransform = 'translate(' + this.translate.x.toString() + 'px,' + this.translate.y.toString() + 'px)';
    
    this.curGlass.position.x = this.dom.offsetWidth / 2 - this.translate.x;
    this.curGlass.position.y = this.dom.offsetHeight / 2 - this.translate.y;

    //if (this.eventval.curPPao) this.eventval.curPPao = null;
}
paopao.setGraphMousedown = function (e) {
    var p = { x: e.data.global.x, y: e.data.global.y },
        ppao = this.getPPaoByPosition(p);
    if (!ppao) return;
    this.eventval.curPPao = ppao;
}
paopao.setGraphMouseup = function (e) {
    if (!this.eventval.curPPao) return;
    this.eventval.curPPao.explosion();
    //console.log(this.eventval.curPPao);
}

paopao.getPPaoByPosition = function (position) {
    var p = position,
        arr = this.positions;
    for (var i = 0; i < arr.length; i++) {
        var o = arr[i].ppao;
        if (!o.clicked) continue;
        //既然点中了图形,此处做粗略判断
        if ((o.curRadias + o.point.x >= p.x) && (o.point.x - o.curRadias <= p.x)) {
            if ((o.curRadias + o.point.y >= p.y) && (o.point.y - o.curRadias <= p.y)) {
                return o;
            }
        }
    }
    return false;
}

//生产泡泡坐标
paopao.createPosition = function (loop) {
    var domWidth = this.dom.clientWidth,
        domHeight = this.dom.clientHeight;
    var temp = [],
        unit = this.baseWith * 1.2,
        minus = this.baseWith * 0.2;
    var eWidth = this.width,
        eHeight = this.height,
        xN = 0,
        yN = 0,
        mX = 0,
        mY = 0;

    if (domWidth > domHeight) {
        eWidth -= domWidth - domHeight;

        yN = Math.ceil(this.height / (unit + minus)) - 2;
        xN = Math.ceil(eWidth / (unit + minus)) - 1;

        mY = unit * 0.5;
        mX = (domWidth - domHeight) / 2;
    } else {
        eHeight = this.height - domHeight + domWidth;
        yN = Math.ceil(eHeight / (unit + minus)) - 1;
        xN = Math.ceil(this.width / (unit + minus)) - 2;

        mY = (domHeight - domWidth) / 2;
        mX = unit * 0.5;
    }

    for (var i = 0; i < xN; i++) {
        var tempX = (i + 0.5) * unit + mX;
        if (tempX > this.width) continue;
        for (var j = 0; j < yN; j++) {
            var tempY = (j + 0.5) * unit + mY;
            if (tempY > this.height) continue;
            var o = { x: j % 2 === 0 ? tempX + unit * 0.5 : tempX, y: tempY };
            temp.push(o);
            if (loop) loop(o);
        }
    }
    return temp;
}

paopao.setCanvanPosition = function (ctx) {
    this.translate = {
        x: -ctx.width * 0.25,
        y: -ctx.height * 0.25,
        maxX: 0,
        maxY: 0,
        minX: -ctx.width * 0.5,
        minY: -ctx.height * 0.5
    };
    ctx.style.transform = 'translate(' + this.translate.x + 'px,' + this.translate.y + 'px)';
    ctx.style.webkittransform = 'translate(' + this.translate.x + 'px,' + this.translate.y + 'px)';
}

paopao.createGlass = function (positions) {
    var p = {
        x: this.dom.offsetWidth / 2 - this.translate.x,
        y: this.dom.offsetHeight / 2 - this.translate.y,
        r: (this.dom.offsetWidth < this.dom.offsetHeight ? this.dom.offsetWidth / 2 : this.dom.offsetHeight / 2)
    };
    if (this.curGlass) {
            
    }
    this.curGlass = new this.glass(p, positions);
}


//泡泡类
var ppao = paopao.ppao = function (x, y, color) {
    if (!(color in this.colors)) return null;
    this.point = {
        x: x,
        y: y,
        color: color
    }
    this['set' + this.colors[color]()]();
}
ppao.prototype.baseWidth = parseInt(document.documentElement.clientWidth / 160);
ppao.prototype.colors = {
    'yellow': function () {
        return 'Yellow';
    }, 'blue': function () {
        return 'Blue';
    }, 'red': function () {
        return 'Red';
    }, 'cyanblue': function () {
        return 'Cyanblue';
    }, 'gray': function () {
        return 'Gray';
    }
};
    //创建泡泡
    ppao.prototype.create = function (graphics, stage, radias,curPosition) {
        var self = this;
        if (this.died) return;
        if (!stage) return false;
        if (!graphics) return false;

        if (this.dieding) {
            this.explosion();
            return;
        }

        //固定每次变化的数值
        this.add = 5;

        //当是第一次进入创建泡泡时候
        if (typeof this.curRadias === 'undefined') {
            this.curRadias = this.baseWidth;
        }
        var addTemp = this.curRadias+5;
        var munTemp = this.curRadias - 5;

        this.clicked = true;
        if (this.curRadias === radias) {
            if (radias === this.baseWidth) {
                this.clicked = false;
            }
        }else if (this.curRadias < radias) {
            this.curRadias = addTemp < radias ? addTemp : radias;
        } else {
            this.curRadias = munTemp > radias ? munTemp : radias;
        }

        graphics.lineStyle(0);
        graphics.beginFill(self.draw.color, 0.5);
        graphics.drawCircle(self.point.x, self.point.y, self.curRadias);
        //graphics.drawEllipse(self.point.x, self.point.y, self.curRadias, self.curRadias);
        graphics.endFill();

        
    }

    //黄色泡泡
    ppao.prototype.setYellow = function (color) {
        this.draw = {
            color: 0xFFFF0B
        }

    }
    //蓝色泡泡
    ppao.prototype.setBlue = function (color) {
        this.draw = {
            color: 0x4990F4
        }

    }
    //红色泡泡
    ppao.prototype.setRed = function (color) {
        this.draw = {
            color: 0xFB2D78
        }

    }
    //青色泡泡
    ppao.prototype.setCyanblue = function (color) {
        this.draw = {
            color: 0x0FCDC3
        }

    }
    //灰色泡泡
    ppao.prototype.setGray = function (color) {
        this.draw = {
            color: 0xc1c1c1
        }

    }

    //泡泡销毁
    ppao.prototype.destroy = function () {
        this.dieding = true;

        //this.died = true;
    }
    //泡泡爆炸
    ppao.prototype.explosion = function () {
        var self = this;

        var numX = 6;
        var radias = 2;
        var life = [5, 10, 15, 20, 25];
        var unit = Math.ceil(self.curRadias * 2 / numX);

        //var numX = Math.ceil(self.curRadias * 2 / 8);
        if (!this.explos) {
            this.dieding = true;
            var minX = self.point.x - self.curRadias,
                maxX = self.point.x + self.curRadias,
                minY = self.point.y - self.curRadias,
                maxY = self.point.y + self.curRadias;
            
            var tmp = this.explos = [];
            for (var i = 0; i < unit; i++) {
                var xx = self.point.x - self.curRadias + numX * i;
                for (var j = 0; j < unit; j++) {
                    var yy = self.point.y - self.curRadias + numX * j;

                    var _x = xx - self.point.x,
                        _y = yy - self.point.y;
                    var v = Math.sqrt(_x * _x + _y * _y);
                    //圆粗略过滤
                    if (v < self.curRadias) {
                        var m = Math.random();
                        var o = { x: xx, y: yy, curPosition: { type: 'hide', x: xx, y: yy + 0, life: m < 0.8 ? m < 0.6 ? m < 0.4 ? m < 0.2 ? life[0] : life[1] : life[2] : life[3] : life[4] } };
                        //console.log(o)
                        o.ppow = new ppowder(o.x, o.y, self.point.color, o.curPosition);
                        tmp.push(o);
                        //return;
                    }
                }
            }
        } else {
            var tmp = this.explos;
            for (var i = 0; i < tmp.length; i++) {
                var o = tmp[i];
                if (o.ppow.hidden) {
                    tmp.splice(i,1);
                    continue;
                }
                o.ppow.create(paopao.graphics, paopao.stage, radias);
            }
        }
    }

//爆炸粉末类（继承泡泡类）
var ppowder = function (x, y, color,curPosition) {
    ppao.call(this, x, y, color);
    this.curPosition = { x: curPosition.x, y: curPosition.y, life: curPosition.life, type: curPosition.type };
    
};
ppowder.prototype = Object.create(ppao.prototype);
ppowder.prototype.create = function (graphics, stage, radias) {
    var self = this;

    if (this.hidden) {
        return;
    }
    if (!stage) return false;
    if (!graphics) return false;
   
    if (this.curPosition.type === 'hide') {
        if (this.curPosition.life === -1) {
        } else if (this.curPosition.life > 0) {
            this.curPosition.life--;
            
        } else {
            this.hidden = true;
            return;
        }
    } else {
        if (this.curPosition.x === this.point.x && this.curPosition.y === this.point.y) {
            this.hidden = true;
            return;
        }
        //固定每次变化的数值
        var add = 6,
            nX = this.curPosition.x - this.point.x,
            nY = this.curPosition.y - this.point.y;
        var addX = Math.abs(nX) >= add ? nX > 0 ? add : -add : nX,
            addY = Math.abs(nY) >= add ? nY > 0 ? add : -add : nY;

        this.point.x += addX;
        this.point.y += addY;
    }

    graphics.lineStyle(0);
    graphics.beginFill(self.draw.color, 0.5);
    graphics.drawCircle(self.point.x, self.point.y, radias);
    graphics.endFill();
}

    //扩大镜类
    var glass = paopao.glass = function (position, positions) {
        this.position = position;
        this.positions = positions;
        this.setDeafult();
        this.changePao();
    }
    glass.prototype.glassInterval = function () {
        var self = this;
       
    }
    glass.prototype.setDeafult = function () {

    }

    //聚焦功能(改变泡泡大小)
    glass.prototype.changePao = function () {
        var arr = this.positions,
            p = this.position,
            maxX = p.x + p.r,
            maxY = p.y + p.r*1.5,
            minX = p.x - p.r,
            minY = p.y - p.r;
        paopao.graphics.clear();
        for (var i = 0; i < arr.length; i++) {
            var xx = arr[i].x - p.x,
                yy = arr[i].y - p.y;
           
            if (arr[i].x > maxX || arr[i].y > maxY || arr[i].x < minX || arr[i].y < minY) {
                arr[i].ppao.create(paopao.graphics, paopao.stage, arr[i].ppao.baseWidth);
            } else {
                var v = Math.sqrt(xx * xx + yy * yy);
                //if (v < p.r) {
                    arr[i].ppao.create(paopao.graphics, paopao.stage, paopao.radius * this.mun(v, p.r));
                //} 
            }
        }
    }

//偏差改变成百分比
    glass.prototype.mun = function (v, r) {
   
    var m = v / r;
    return 1 - m + m * 0.3;
}
//偏差改变成百分比（扩大镜之外）
glass.prototype.mun2 = function (v, r) {
    var m = r / v * 0.8;
    return 1 - m;
}
