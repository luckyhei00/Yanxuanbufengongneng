//轮播图组件

/*
 * 组件api说明
 * 	1、依赖move.js，组件前一定要引入move.js
 * 	2、轮播图需要有一个父级，这个父级一定要给一个id
 */

;
(function(window, undefined) {

	//构造函数

	var Carousel = function() {
		this.settings = {
			id: 'pic', //轮播图父级的id，必需传的参数
			autoplay: true, //自动播放，true为自动，false为不自动，默认为true
			intervalTime: 1000, //间隔时间，运动后停顿的时间，默认1s
			loop: true, //循环播放，true为循环，false为不循环，默认为true
			totalNum: 5, //图片总量
			moveNum: 1, //单次运动的图片数量（图片总量必须为运动数量的整倍数）
			circle: true, //小圆点功能，true为显示，false为不显示，默认显示
			moveWay: 'opacity' //运动方式，opacity为透明度过渡，position为位置过渡
		};

	};

	//原型

	Carousel.prototype = {

		//加固指向

		constructor: Carousel,

		//初始化

		init: function(opt) {
			var opt = opt || this.settings;

			for(var attr in opt) {
				this.settings[attr] = opt[attr];
			};

			this.createDom();
		},

		//生成DOM

		createDom: function() {
			var This = this;
			this.box = document.getElementById(this.settings.id);

			this.prevBtn = document.createElement("div");
			this.prevBtn.className = 'prev';
			this.prevBtn.innerHTML = '<';
			this.prevBtn.onclick = function() {
				This.prev();
				This.trigger('leftClick');
			};
			this.box.appendChild(this.prevBtn);

			this.nextBtn = document.createElement("div");
			this.nextBtn.className = 'next';
			this.nextBtn.innerHTML = '>';
			this.nextBtn.onclick = function() {
				This.next();
				This.trigger('rightClick');
			};
			this.box.appendChild(this.nextBtn);

			this.circleWarp = document.createElement("div");
			this.circleWarp.className = 'circle';
			this.circles = [];

			for(var i = 0; i < this.settings.totalNum / this.settings.moveNum; i++) {
				var span = document.createElement("span");
				span.index = i;

				span.onclick = function() {
					This.cn = this.index;
					This[This.settings.moveWay + 'Fn']();
				};
				this.circleWarp.appendChild(span);
				this.circles.push(span);
			};

			this.circles[0].className = 'active';

			if(this.settings.circle) {
				this.box.appendChild(this.circleWarp);
			};

			this.moveInit();
		},

		//运动初始化

		moveInit: function() {
			this.cn = 0;
			this.ln = 0;
			this.canClick = true;
			this.endNum = this.settings.totalNum / this.settings.moveNum;
			this.opacityItem = this.box.children[0].children;
			this.positionItemWrap = this.box.children[0].children[0];
			this.positionItem = this.positionItemWrap.children;

			switch(this.settings.moveWay) {
				case 'opacity':
					for(var i = 0; i < this.opacityItem.length; i++) {
						this.opacityItem[i].style.opacity = 0;
						this.opacityItem[i].style.transition = '.5s opacity';
					};
					this.opacityItem[0].style.opacity = 1;

					break;

				case 'position':
					var leftMargin = parseInt(getComputedStyle(this.positionItem[0]).marginLeft);
					var rightMargin = parseInt(getComputedStyle(this.positionItem[0]).marginRight);
					this.singleWidth = leftMargin + this.positionItem[0].offsetWidth + rightMargin;

					if(this.settings.loop) {
						this.positionItemWrap.innerHTML += this.positionItemWrap.innerHTML;
					};

					this.positionItemWrap.style.width = this.singleWidth * this.positionItem.length + 'px';

					break;
			};

			if(this.settings.autoplay) {
				this.autoPlay();
			};

		},

		//透明度运动

		opacityFn: function() {

			if(this.cn < 0) {
				if(this.settings.loop) {
					this.cn = this.endNum - 1;
				} else {
					this.cn = 0;
					this.canClick = true;
				};
			};

			if(this.cn > this.endNum - 1) {
				if(this.settings.loop) {
					this.cn = 0;
				} else {
					this.cn = this.endNum - 1;
					this.canClick = true;
				};
			};

			this.opacityItem[this.ln].style.opacity = 0;
			this.circles[this.ln].className = '';

			this.opacityItem[this.cn].style.opacity = 1;
			this.circles[this.cn].className = 'active';

			var This = this;
			var en = 0;

			this.opacityItem[this.cn].addEventListener('transitionend', function() {
				en++;
				if(en == 1) {
					This.canClick = true;
					This.ln = This.cn;

					This.endFn();
				}
			});
		},

		//位置运动

		positionFn: function() {

			if(this.cn < 0) {
				if(this.settings.loop) {
					this.positionItemWrap.style.left = -this.positionItemWrap.offsetWidth / 2 + 'px';
					this.cn = this.endNum - 1;
				} else {
					this.cn = 0;
				};
			};

			if(this.cn > this.endNum - 1 && !this.settings.loop) {
				this.cn = this.endNum - 1;
			};

			if(!this.settings.loop) {
				this.circles[this.ln].className = '';
				this.circles[this.cn].className = 'active';
			}

			var This = this;
			move(this.positionItemWrap, {
				left: -this.cn * this.singleWidth * this.settings.moveNum
			}, 500, 'linear', function() {

				if(This.cn == This.endNum) {
					this.style.left = 0;
					This.cn = 0;
				};

				This.endFn();

				This.canClick = true;
				This.ln = This.cn;
			});

		},

		//上一个功能

		prev: function() {
			if(!this.canClick) {
				return;
			};

			this.canClick = false;
			this.cn--;
			this[this.settings.moveWay + 'Fn']();
		},

		//下一个功能

		next: function() {
			if(!this.canClick) {
				return;
			};

			this.canClick = false;
			this.cn++;
			this[this.settings.moveWay + 'Fn']();
		},

		//自动播放功能

		autoPlay: function() {

			var This = this;
			this.timer = setInterval(function() {
				This.next();
			}, this.settings.intervalTime);

			this.box.onmouseenter = function() {
				clearInterval(This.timer);
				this.timer = null;
			};

			this.box.onmouseleave = function() {
				This.autoPlay();
			};
		},

		//自定义函数绑定

		on: function(type, listener) {
			this.events = this.events || {};
			this.events[type] = this.events[type] || [];
			this.events[type].push(listener);
		},

		//自定义函数触发

		trigger: function(type) {
			if(this.events && this.events[type]) {
				for(var i = 0; i < this.events[type].length; i++) {
					this.events[type][i].call(this);
				}
			}
		},

		endFn: function() {
			if(!this.settings.loop) {
				if(this.cn == 0) {
					this.trigger('leftEnd');
				}

				if(this.cn == this.endNum - 1) {
					this.trigger('rightEnd');
				}
			}
		}
	};

	window.Carousel = Carousel;
})(window, undefined);