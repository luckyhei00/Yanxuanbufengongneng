/*----------公用功能部分----------*/

/*------工具部分------*/

window.yx = {

	//元素获取

	g: function(name) {
		return document.querySelector(name);
	},
	ga: function(name) {
		return document.querySelectorAll(name);
	},

	//自定义事件

	addEvent: function(obj, ev, fn) {
		if(obj.addEventListener) {
			obj.addEventListener(ev, fn);
		} else {
			obj.attachEvent('on' + ev, fn);
		}
	},
	removeEvent: function(obj, ev, fn) {
		if(obj.removeEventListener) {
			obj.removeEventListener(ev, fn);
		} else {
			obj.detachEvent('on' + ev, fn);
		}
	},

	//获取top值

	getTopValue: function(obj) {
		var top = 0;
		while(obj.offsetParent) {
			top += obj.offsetTop;
			obj = obj.offsetParent;
		};

		return top;
	},

	//倒计时工具

	cutTime: function(target) {
		var curDate = new Date();
		var v = Math.abs(target - curDate);

		return {
			d: parseInt(v / (24 * 3600000)),
			h: parseInt(v % (24 * 3600000) / 3600000),
			m: parseInt(v % (24 * 3600000) % 3600000 / 60000),
			s: parseInt(v % (24 * 3600000) % 3600000 % 60000 / 1000)
		};
	},

	//补0工具

	format: function(v) {
		return v < 10 ? '0' + v : '' + v;
	},

	//解析时间戳工具

	formatDate: function(time) {
		var d = new Date(time);
		return d.getFullYear() + '-' + yx.format(d.getMonth() + 1) + '-' + yx.format(d.getDate()) + ' ' + yx.format(d.getHours()) + ':' + yx.format(d.getMinutes());
	},

	//拆分重组地址工具

	parseUrl: function(url) {
		var reg = /(\w+)=(\w+)/ig;
		var result = {};

		url.replace(reg, function(a, b, c) {
			result[b] = c;
		});

		return result;
	},

	/*------公用功能------*/

	public: {

		//导航条功能

		navFn: function() {
			var nav = yx.g('#head .nav');
			var lis = yx.ga('#head .navBar li');
			var subNav = yx.g('#head .subNav');
			var uls = yx.ga('#head .subNav ul');
			var newLis = [];

			for(var i = 1; i < lis.length - 3; i++) {
				newLis.push(lis[i]);
			};

			for(var i = 0; i < newLis.length; i++) {
				newLis[i].index = uls[i].index = i;
				newLis[i].onmouseenter = uls[i].onmouseenter = function() {
					newLis[this.index].className = 'active';
					subNav.style.opacity = 1;
					uls[this.index].style.display = 'block';
				};
				newLis[i].onmouseleave = uls[i].onmouseleave = function() {
					newLis[this.index].className = '';
					subNav.style.opacity = 0;
					uls[this.index].style.display = 'none';
				};
			};

			yx.addEvent(window, 'scroll', setNavPos);
			setNavPos();

			function setNavPos() {
				nav.id = window.pageYOffset > nav.offsetTop ? 'navFix' : '';
			};
		},

		//购物车功能

		shopFn: function() {

			//购物车添加商品

			var productNum = 0;
			(function(local) {
				var totalPrice = 0;
				var ul = yx.g(".cart ul");
				var li = '';
				ul.innerHTML = '';

				for(var i = 0; i < local.length; i++) {
					var attr = local.key(i);
					var value = JSON.parse(local[attr]);

					if(value && value.sign == 'productLocal') {
						li += '<li data-id="' + value.id + '">' +
							'<a href="#" class="img"><img src="' + value.img + '"/></a>' +
							'<div class="message">' +
							'<p><a href="#">' + value.name + '</a></p>' +
							'<p>' + value.spec.join(' ') + ' x ' + value.num + '</p>' +
							'</div>' +
							'<div class="price">¥' + value.price + '.00</div>' +
							'<div class="close">X</div>' +
							'</li>';

						totalPrice += parseFloat(value.price) * Number(value.num);
					};
				};
				ul.innerHTML = li;

				productNum = ul.children.length;
				yx.g(".cartWrap i").innerHTML = productNum;
				yx.g(".cartWrap .total span").innerHTML = '¥' + totalPrice + '.00';

				//购物车删除商品

				var closeBtns = yx.ga(".cart .list .close");
				for(var i = 0; i < closeBtns.length; i++) {
					closeBtns[i].onclick = function() {
						localStorage.removeItem(this.parentNode.getAttribute('data-id'));

						yx.public.shopFn();

						if(ul.children.length == 0) {
							yx.g(".cart").style.display = 'none';
						};
					};
				};

				//购物车显示隐藏事件

				var cartWrap = yx.g('.cartWrap');
				var timer;

				cartWrap.onmouseenter = function() {
					clearTimeout(timer);
					yx.g('.cart').style.display = 'block';
					scrollFn();
				};
				cartWrap.onmouseleave = function() {
					timer = setTimeout(function() {
						yx.g('.cart').style.display = 'none';
					}, 100);
				};

			})(localStorage);

			//购物车滚动条功能

			function scrollFn() {
				var contentWrap = yx.g(".cart .list");
				var content = yx.g(".cart .list ul");
				var scrollBar = yx.g(".cart .scrollBar");
				var slideWrap = yx.g(".cart .slideWrap");
				var slide = yx.g(".cart .slide");
				var btns = yx.ga(".cart .scrollBar span");
				var timer = null;

				var beishu = content.offsetHeight / contentWrap.offsetHeight;

				scrollBar.style.display = beishu <= 1 ? 'none' : 'block';

				if(beishu > 20) {
					beishu = 20;
				};

				slide.style.height = slideWrap.offsetHeight / beishu + 'px';

				//滑块功能

				var scrollTop = 0;
				var maxHeight = slideWrap.offsetHeight - slide.offsetHeight;

				slide.onmousedown = function(ev) {
					var disY = ev.clientY - slide.offsetTop;

					document.onmousemove = function(ev) {
						scrollTop = ev.clientY - disY;
						scroll();
					};
					document.onmouseup = function() {
						this.onmousemove = null;
					};

					ev.cancelBubble = true;
					return false;
				};

				//滚轮功能

				myScroll(contentWrap, function() {
					scrollTop -= 10;
					scroll();
					clearInterval(timer);
				}, function() {
					scrollTop += 10;
					scroll();
					clearInterval(timer);
				});

				//上下箭头功能

				for(var i = 0; i < btns.length; i++) {
					btns[i].index = i;
					btns[i].onmousedown = function(ev) {
						var n = this.index;
						timer = setInterval(function() {
							scrollTop = n ? scrollTop + 10 : scrollTop - 10;
							scroll();
						}, 16);

						document.onmouseup = function() {
							clearInterval(timer);
						};

						ev.cancelBubble = true;
						return false;
					};
				};

				//滑块区域点击功能

				slideWrap.onmousedown = function(ev) {
					var slideTop = slide.getBoundingClientRect().top + slide.offsetHeight / 2;

					if(ev.clientY < slideTop) {
						scrollTop -= 5;
					} else {
						scrolltop += 5;
					};

					if(Math.abs(ev.clientY - slideTop) <= 5) {
						clearInterval(timer);
					};

					scroll();
				};

				//滚动条主体功能

				function scroll() {
					if(scrollTop < 0) {
						scrollTop = 0;
						clearInterval(timer);
					} else if(scrollTop > maxHeight) {
						scrollTop = maxHeight;
						clearInterval(timer);
					};

					var scaleY = scrollTop / maxHeight;

					slide.style.top = scrollTop + 'px';
					content.style.top = -(content.offsetHeight - contentWrap.offsetHeight) * scaleY + 'px';

				};

				//滚轮事件封装

				function myScroll(obj, upFn, downFn) {
					obj.onmousewheel = fn;
					obj.addEventListener('DOMMouseScroll', fn);

					function fn(ev) {
						if(ev.wheelDelta > 0 || ev.detail < 0) {
							upFn.call(obj);
						} else {
							downFn.call(obj);
						};

						ev.preventDefault();
						return false;
					};
				};
			};
		},

		//图片懒加载

		lazyImgFn: function() {

			yx.addEvent(window, 'scroll', delayImg);
			delayImg();

			function delayImg() {
				var originals = yx.ga('.original');
				var scrollTop = window.innerHeight + window.pageYOffset;

				for(var i = 0; i < originals.length; i++) {
					if(yx.getTopValue(originals[i]) < scrollTop) {
						originals[i].src = originals[i].getAttribute('data-original');
						originals[i].removeAttribute('class');
					};
				};

				if(originals[originals.length - 1].getAttribute('src') != 'img/empty.gif') {
					yx.removeEvent(window, 'scroll', delayImg);
				};
			};
		},

		//返回顶部功能

		backFn: function() {
			var back = yx.g('.back');
			var timer = null;

			back.onclick = function() {
				var top = window.pageYOffset;

				timer = setInterval(function() {
					top -= 200;
					if(top <= 0) {
						top = 0;
						clearInterval(timer);
					}
					window.scrollTo(0, top);
				}, 16);
			};
		}
	}
}