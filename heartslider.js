/* 
❤  Heartslider  ❤
❤ Version 3.1.5 ❤
=== Changelog ===
3.1.5 - Cleaning up repo and getting ready for 4.0
3.1.4 - Support for multiple images within slides
3.1.3 - First slide no longer takes years to fade in on start
3.1.2 - Comment improvements, removed will-change from CSS
3.1.1 - Fixed setting paused issues, added option to enable pauseOnInactiveWindow
*/

class HeartSlider {
	constructor(userSettings) {
		var _this = this;

		/* HeartSlider default settings */
		_this.settings = {
			delay: 1000,
			effect: "fadeOut",
			loop: true,
			paused: false,
			pauseOnInactiveWindow: false,
			progressive: true,
			randomize: false,
			slideshow: ".heart-slideshow",
			slides: ".heart-slide",
			swipe: true,
			clickToAdvance: false,
			transition: 3000,
		};

		/* Overwrite defaults with user-defined settings */
		for (var prop in userSettings) {
			if (this.settings.hasOwnProperty(prop)) {
				this.settings[prop] = userSettings[prop];
			}
		}

		/* Check to see if slideshow actually exists */
		/* If `slideshow` is a string, then use a query selector. If it is already a query selector, then use that. */
		this.slideshowSelector = typeof _this.settings.slideshow === "object" ? _this.settings.slideshow : document.querySelector(_this.settings.slideshow);

		/* Dont. Want. None. Unless. You. Got. Buns. Hun. */
		if (!this.slideshowSelector) return false;

		/* In case you forgot to add heart-slideshow class, add it so the CSS will work */
		if (!this.slideshowSelector.classList.contains("heart-slideshow")) {
			this.slideshowSelector.classList.add("heart-slideshow");
		}

		/* Grab all heart-slides */
		this.slides = Array.prototype.slice.apply(this.slideshowSelector.querySelectorAll(this.settings.slides));
		/* If there are no elements with the heart-slide class, then fallback to use the direct children of the main div */
		if (this.slides.length === 0) {
			this.slides = Array.prototype.slice.apply(this.slideshowSelector.children);
		}

		/* Loop through each slide  */
		this.slides.forEach(function (slide) {
			slide.setAttribute("aria-hidden", "true");
			slide.setAttribute("tab-index", "-1");
			if (!slide.classList.contains("heart-slide")) {
				slide.classList.add("heart-slide");
			}
			if (_this.settings.swipe) {
				slide.setAttribute("draggable", "true");
			}
		});

		/* Setting up scoped variables */
		this.total = this.slides.length;
		this.index = 0;
		this.manualTimeout;
		// this.transitioning = false;

		/* Start */
		if (this.settings.randomize) this.index = Math.floor(Math.random() * this.total);
		if (this.settings.progressive) this.progressiveLoad(this.index, true, this);

		this.goToSlide(this.index, false, true);

		if (this.slides.length < 2) return false;

		_this.kickstart = function () {
			if (!this.settings.paused) {
				var currentIndex = this.index;

				var startProgressiveLoad = function startProgressiveLoad() {
					setTimeout(function () {
						_this.progressiveLoad((currentIndex + 1 + _this.total) % _this.total);
					}, _this.settings.delay);
				};

				window.requestAnimationFrame(startProgressiveLoad);

				setTimeout(function () {
					_this.resume();
				}, _this.settings.delay);
			}
		};
		if (!_this.settings.progressive) {
			_this.kickstart();
		}

		var initVis = function initVis() {
			return _this.heartVisibilityHandler(_this);
		};
		if (_this.settings.pauseOnInactiveWindow) {
			document.addEventListener("visibilitychange", initVis, true);
		}

		if (_this.settings.swipe) {
			_this.slideshowSelector.addEventListener("touchstart", _this.swipeHandler(_this).handleTouchStart, false);
			_this.slideshowSelector.addEventListener("touchmove", _this.swipeHandler(_this).handleTouchMove, false);
		}

		if (_this.settings.clickToAdvance) {
			_this.slideshowSelector.addEventListener(
				"click",
				function () {
					_this.next(_this, true);
				},
				false
			);
		}

		_this.prevNextHandler = function (targetIndex, indexToProgressiveLoad, isManuallyCalled) {
			if (_this.transitioning == true) {
				if (isManuallyCalled == true) {
					/* This triggers if a manual transition is called during an automatic one*/
					// console.log("Manual trigger during auto transition");
					_this.pause();
					_this.goToSlide(_this.index, isManuallyCalled);
					clearTimeout(_this.manualTimeout);
					_this.manualTimeout = setTimeout(_this.resume(), 400);
					return;
				} else {
					return;
				}
			}

			_this.goToSlide(targetIndex, isManuallyCalled);

			if (_this.settings.progressive) {
				setTimeout(function () {
					_this.progressiveLoad(indexToProgressiveLoad);
				}, _this.settings.delay);
			}
			setTimeout(function () {
				_this.transitioning = false;
			}, _this.settings.transition);
		};
	}

	swipeHandler(_this) {
		this.xDown = null;
		this.yDown = null;

		function getTouches(evt) {
			return (
				evt.touches || // browser API
				evt.originalEvent.touches
			); // jQuery
		}

		function handleTouchStart(evt) {
			const firstTouch = getTouches(evt)[0];
			this.xDown = firstTouch.clientX;
			this.yDown = firstTouch.clientY;
		}

		function handleTouchMove(evt) {
			if (!this.xDown || !this.yDown) {
				return;
			}

			var xUp = evt.touches[0].clientX;
			var yUp = evt.touches[0].clientY;

			var xDiff = this.xDown - xUp;
			var yDiff = this.yDown - yUp;

			if (Math.abs(xDiff) > Math.abs(yDiff)) {
				/*most significant*/
				if (xDiff > 0) {
					evt.preventDefault();
					/* Right swipe */
					_this.pause();
					_this.next(_this, true);
					setTimeout(_this.resume(), 400);
				} else {
					evt.preventDefault();
					/* Left swipe */
					_this.pause();
					_this.previous(_this, true);
					// setTimeout(_this.resume(), 400);
				}
			}
			// else {
			// 	if (yDiff > 0) {
			// 		/* Up swipe */
			// 	} else {
			// 		/* Down swipe */
			// 	}
			// }
			/* reset values */
			this.xDown = null;
			this.yDown = null;
		}
		return {
			getTouches: getTouches,
			handleTouchStart: handleTouchStart,
			handleTouchMove: handleTouchMove,
		};
	}
	heartVisibilityHandler(_this) {
		/* Disables the slideshow when the window in not in view */
		if (_this !== null && _this.settings.pauseOnInactiveWindow && document.querySelector(_this.settings.slideshow) !== null) {
			if (document.visibilityState == "hidden") {
				console.log("%cWindow Lost Focus. HeartSlider is Paused.", "font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;");
				_this.pause();
			} else {
				console.log("%cRegained Focus. Resumed HeartSlider.", "font-style: italic; font-size: 0.9em; color: #6F9F67; padding: 0.2em;");
				_this.resume();
			}
		}
	}
	goToSlide(targetIndex, isManuallyCalled = false, isFirstSlide = false) {
		/* Check if slides are animating, if so, don't run this again. */
		if (this.transitioning && !isManuallyCalled) return;
		var skipDefaultTransition = targetIndex === this.index && isManuallyCalled;
		/* Set transitioning to true */
		this.transitioning = true;

		/* 
		1) Remove the old active class
		2) Find the new active slide
		3) Add the new active class 
		*/
		var _this = this;
		var oldslide = _this.slides[_this.index];
		_this.index = (targetIndex + _this.total) % _this.total;
		var newslide = _this.slides[_this.index];

		function changeSlides() {
			/* setting up global duration */
			var duration = isManuallyCalled || isFirstSlide || skipDefaultTransition ? 400 : _this.settings.transition;

			/* remove styles from old slide */
			if (oldslide !== newslide) {
				oldslide.classList.remove("active");
				oldslide.setAttribute("aria-hidden", "true");
				oldslide.setAttribute("tab-index", "-1");
				oldslide.style.transitionDelay = duration + "ms";
				oldslide.style.transitionDuration = 0 + "ms";
			}

			/* add styles to new slide */
			newslide.style.transitionDuration = duration + "ms";
			newslide.style.transitionDelay = 0 + "ms";
			newslide.classList.add("active");
			newslide.removeAttribute("aria-hidden");
			newslide.removeAttribute("tab-index");

			setTimeout(function () {
				_this.transitioning = false;
			}, duration);
		}

		window.requestAnimationFrame(changeSlides);
	}
	progressiveLoad(target, isFirstSlide = false, _this) {
		var currentImages = Array.prototype.slice.call(this.slides[target].querySelectorAll("img"));
		if (currentImages.length > 0) {
			currentImages.forEach((currentImage, index) => {
				if (currentImage == undefined || currentImage.classList.contains("image-loaded") || currentImage.currentSrc === null) return;
				currentImage.addEventListener("load", function () {
					this.classList.add("image-loaded");
					if (isFirstSlide && index == 0) {
						console.log("isFirstSlide? (within progressiveLoad)", isFirstSlide);
						// start slideshow for realziesz
						console.log("kickstart on first image");
						_this.kickstart();
					}
				});
				var atts = ["sizes", "srcset", "src"];
				atts.forEach(function (attribute) {
					var targetAtt = currentImage.getAttribute("data-" + attribute);
					if (targetAtt && currentImage.getAttribute(attribute) == null) {
						currentImage.setAttribute(attribute, targetAtt);
						currentImage.setAttribute("data-" + attribute, "");
					}
				});
			});
		}
	}
	next(_this, isManuallyCalled = false) {
		var nextIndex = this.index + 1 || 1;
		var indexToProgressiveLoad = (nextIndex + 1 + _this.total) % _this.total;

		_this.prevNextHandler(nextIndex, indexToProgressiveLoad, isManuallyCalled);
	}
	previous(_this = this, isManuallyCalled = false) {
		var previousIndex = (_this.index - 1 + _this.total) % _this.total;
		var indexToProgressiveLoad = previousIndex;

		_this.prevNextHandler(previousIndex, indexToProgressiveLoad, isManuallyCalled);
	}
	resume() {
		var _this = this;

		if (_this.settings.paused == true) {
			_this.settings.paused = false;
		}

		if (_this.settings.progressive) {
			setTimeout(function () {
				_this.progressiveLoad((_this.index + 1 + _this.total) % _this.total);
			}, _this.settings.delay);
		}

		_this.goToSlide(_this.index + 1);

		this.slideInterval = setInterval(function () {
			_this.next(_this);
		}, _this.settings.delay + _this.settings.transition);
	}
	pause() {
		const _this = this;
		_this.settings.paused = true;
		clearInterval(this.slideInterval);
	}
}
