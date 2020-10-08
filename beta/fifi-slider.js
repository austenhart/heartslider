// below is the plugin code
'use strict';

function $(elem) {
    return document.querySelector(elem);
}

function hasClass(el, className) {
    return el.classList ? el.classList.contains(className) : new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}

function addClass(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else {
        el.className += ' ' + className;
    }
}

function removeClass(el, className) {
    if (el.classList) {
        el.classList.remove(className);
    } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}

function $extendObj(_def, addons) {
    if (typeof addons !== "undefined") {
        for (var prop in _def) {
            if (addons[prop] != undefined) {
                _def[prop] = addons[prop];
            }
        }
    }
}

var slider_plugin = (function () {

    var fifi_slider = function (settings) {
        var _ = this;

        // always loop
        _.def = {
            target: $('.slider'),
            dotsWrapper: $('.dots-wrapper'),
            arrowLeft: $('.arrow-left'),
            arrowRight: $('.arrow-right'),
            transition: {
                speed: 300,
                easing: ''
            },
            swipe: true,
            autoHeight: true,
            afterChangeSlide: function afterChangeSlide() {}
        }

        $extendObj(_.def, settings);

        _.init();
    }

    fifi_slider.prototype.buildDots = function () {
        var _ = this;

        for (var i = 0; i < _.totalSlides; i++) {
            var dot = document.createElement('li');
            dot.setAttribute('data-slide', i + 1);
            _.def.dotsWrapper.appendChild(dot);
        }

        _.def.dotsWrapper.addEventListener('click', function (e) {
            if (e.target && e.target.nodeName == "LI") {
                _.curSlide = e.target.getAttribute('data-slide');
                _.gotoSlide();
            }
        }, false);
    }
    fifi_slider.prototype.getCurLeft = function () {
        var _ = this;
        _.curLeft = parseInt(_.sliderInner.style.left.split('px')[0]);
    }
    fifi_slider.prototype.gotoSlide = function () {
        var _ = this;

        _.sliderInner.style.transition = 'left ' + _.def.transition.speed / 1000 + 's ' + _.def.transition.easing;
        _.sliderInner.style.left = -_.curSlide * _.slideW + 'px';
        addClass(_.def.target, 'isAnimating');
        setTimeout(function () {
            _.sliderInner.style.transition = '';
            removeClass(_.def.target, 'isAnimating');
        }, _.def.transition.speed);
        _.setDot();
        if (_.def.autoHeight) {
            _.def.target.style.height = _.allSlides[_.curSlide].offsetHeight + "px";
        }
        _.def.afterChangeSlide(_);
    }
    fifi_slider.prototype.init = function () {
        var _ = this;

        function on_resize(c, t) {
            onresize = function () {
                clearTimeout(t);
                t = setTimeout(c, 100);
            }
            return onresize;
        }

        function loadedImg(el) {
            var loaded = false;

            function loadHandler() {
                if (loaded) {
                    return;
                }
                loaded = true;
                _.loadedCnt++;
                if (_.loadedCnt >= _.totalSlides + 2) {
                    _.updateSliderDimension();
                }
            }
            var img = el.querySelector('img');
            if (img) {
                img.onload = loadHandler;
                img.src = img.getAttribute('data-src');
                img.style.display = 'block';
                if (img.complete) {
                    loadHandler();
                }
            } else {
                _.updateSliderDimension();
            }
        }

        window.addEventListener("resize", on_resize(function () {
            _.updateSliderDimension();
        }), false);

        // wrap slider-inner
        var nowHTML = _.def.target.innerHTML;
        _.def.target.innerHTML = '<div class="slider-inner">' + nowHTML + '</div>';

        _.allSlides = 0;
        _.curSlide = 0;
        _.curLeft = 0;
        _.totalSlides = _.def.target.querySelectorAll('.slide').length;

        _.sliderInner = _.def.target.querySelector('.slider-inner');
        _.loadedCnt = 0;

        // append clones
        var cloneFirst = _.def.target.querySelectorAll('.slide')[0].cloneNode(true);
        _.sliderInner.appendChild(cloneFirst);
        var cloneLast = _.def.target.querySelectorAll('.slide')[_.totalSlides - 1].cloneNode(true);
        _.sliderInner.insertBefore(cloneLast, _.sliderInner.firstChild);

        _.curSlide++;
        _.allSlides = _.def.target.querySelectorAll('.slide');

        //_.def.target.style.height = "1px";
        _.sliderInner.style.width = (_.totalSlides + 2) * 100 + "%";
        for (var _i = 0; _i < _.totalSlides + 2; _i++) {
            _.allSlides[_i].style.width = 100 / (_.totalSlides + 2) + "%";
            loadedImg(_.allSlides[_i]);
        }

        _.buildDots();
        _.setDot();
        _.initArrows();

        function addListenerMulti(el, s, fn) {
            s.split(' ').forEach(function (e) {
                return el.addEventListener(e, fn, false);
            });
        }

        function removeListenerMulti(el, s, fn) {
            s.split(' ').forEach(function (e) {
                return el.removeEventListener(e, fn, false);
            });
        }

        if (_.def.swipe) {
            addListenerMulti(_.sliderInner, 'mousedown touchstart', startSwipe);
        }

        _.isAnimating = false;

        function startSwipe(e) {
            var touch = e;
            _.getCurLeft();
            if (!_.isAnimating) {
                if (e.type == 'touchstart') {
                    touch = e.targetTouches[0] || e.changedTouches[0];
                }
                _.startX = touch.pageX;
                _.startY = touch.pageY;
                addListenerMulti(_.sliderInner, 'mousemove touchmove', swipeMove);
                addListenerMulti($('body'), 'mouseup touchend', swipeEnd);
            }
        }

        function swipeMove(e) {
            var touch = e;
            if (e.type == 'touchmove') {
                touch = e.targetTouches[0] || e.changedTouches[0];
            }
            _.moveX = touch.pageX;
            _.moveY = touch.pageY;

            // for scrolling up and down
            if (Math.abs(_.moveX - _.startX) < 40) return;

            _.isAnimating = true;
            addClass(_.def.target, 'isAnimating');
            e.preventDefault();

            if (_.curLeft + _.moveX - _.startX > 0 && _.curLeft == 0) {
                _.curLeft = -_.totalSlides * _.slideW;
            } else if (_.curLeft + _.moveX - _.startX < -(_.totalSlides + 1) * _.slideW) {
                _.curLeft = -_.slideW;
            }
            _.sliderInner.style.left = _.curLeft + _.moveX - _.startX + "px";
        }

        function swipeEnd(e) {
            var touch = e;
            _.getCurLeft();

            if (Math.abs(_.moveX - _.startX) === 0) return;

            _.stayAtCur = Math.abs(_.moveX - _.startX) < 40 || typeof _.moveX === "undefined" ? true : false;
            _.dir = _.startX < _.moveX ? 'left' : 'right';

            if (_.stayAtCur) {} else {
                _.dir == 'left' ? _.curSlide-- : _.curSlide++;
                if (_.curSlide < 0) {
                    _.curSlide = _.totalSlides;
                } else if (_.curSlide == _.totalSlides + 2) {
                    _.curSlide = 1;
                }
            }

            _.gotoSlide();

            delete _.startX;
            delete _.startY;
            delete _.moveX;
            delete _.moveY;

            _.isAnimating = false;
            removeClass(_.def.target, 'isAnimating');
            removeListenerMulti(_.sliderInner, 'mousemove touchmove', swipeMove);
            removeListenerMulti($('body'), 'mouseup touchend', swipeEnd);
        }
    }
    fifi_slider.prototype.initArrows = function () {
        var _ = this;

        if (_.def.arrowLeft != '') {
            _.def.arrowLeft.addEventListener('click', function () {
                if (!hasClass(_.def.target, 'isAnimating')) {
                    if (_.curSlide == 1) {
                        _.curSlide = _.totalSlides + 1;
                        _.sliderInner.style.left = -_.curSlide * _.slideW + 'px';
                    }
                    _.curSlide--;
                    setTimeout(function () {
                        _.gotoSlide();
                    }, 20);
                }
            }, false);
        }

        if (_.def.arrowRight != '') {
            _.def.arrowRight.addEventListener('click', function () {
                if (!hasClass(_.def.target, 'isAnimating')) {
                    if (_.curSlide == _.totalSlides) {
                        _.curSlide = 0;
                        _.sliderInner.style.left = -_.curSlide * _.slideW + 'px';
                    }
                    _.curSlide++;
                    setTimeout(function () {
                        _.gotoSlide();
                    }, 20);
                }
            }, false);
        }
    }
    fifi_slider.prototype.setDot = function () {
        var _ = this;
        var tardot = _.curSlide - 1;

        for (var j = 0; j < _.totalSlides; j++) {
            removeClass(_.def.dotsWrapper.querySelectorAll('li')[j], 'active');
        }

        if (_.curSlide - 1 < 0) {
            tardot = _.totalSlides - 1;
        } else if (_.curSlide - 1 > _.totalSlides - 1) {
            tardot = 0;
        }
        addClass(_.def.dotsWrapper.querySelectorAll('li')[tardot], 'active');
    }
    fifi_slider.prototype.updateSliderDimension = function () {
        var _ = this;

        _.slideW = parseInt(_.def.target.querySelectorAll('.slide')[0].offsetWidth);
        _.sliderInner.style.left = -_.slideW * _.curSlide + "px";

        if (_.def.autoHeight) {
            _.def.target.style.height = _.allSlides[_.curSlide].offsetHeight + "px";
        } else {
            for (var i = 0; i < _.totalSlides + 2; i++) {
                if (_.allSlides[i].offsetHeight > _.def.target.offsetHeight) {
                    _.def.target.style.height = _.allSlides[i].offsetHeight + "px";
                }
            }
        }
        _.def.afterChangeSlide(_);
    }
    return fifi_slider;
})();

var slider = new slider_plugin({
    target: $('.slider'),
    dotsWrapper: $('.dots-wrapper'),
    arrowLeft: $('.arrow-left'),
    arrowRight: $('.arrow-right')
});