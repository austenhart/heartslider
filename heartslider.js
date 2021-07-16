/* 
❤  Heartslider  ❤
❤ Version 3.2.4 ❤

=== Steps to Push New Version ===
1) https://babeljs.io/repl#?browsers=defaults
2) https://javascript-minifier.com
3) Update Changelog and version number in .js, min.js, .css and readme.md

=== Changelog ===
3.2.4 - Fixed issue with tab-index on first slide
3.2.3 - Added support for buttons!
3.2.2 - Fixed issue with progressiveLoad.
3.2.1 - Fixing timing errors with pause/resume/click/swipe.
3.2.0 - Added click and swipe to advance.
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

		/* Setting up scoped variables */
		this.total = this.slides.length;
		this.index = 0;
		this.manualTimeout;
		// this.transitioning = false;

		/* Start */
		if (this.settings.randomize) this.index = Math.floor(Math.random() * this.total);
		if (this.settings.progressive) this.progressiveLoad(this.index, true, this);

		var firstIndex = this.index;

		/* Loop through each slide  */
		this.slides.forEach(function (slide, index) {
			if (index !== firstIndex) {
				slide.setAttribute("aria-hidden", "true");
				slide.setAttribute("tab-index", "-1");
			}
			if (!slide.classList.contains("heart-slide")) {
				slide.classList.add("heart-slide");
			}
			if (_this.settings.swipe) {
				slide.setAttribute("draggable", "true");
			}
		});

		/* add styles to new slide */
		this.goToSlide(firstIndex, false, true);

		if (this.slides.length < 2) return false;

		_this.kickstart = function () {
			if (_this.settings.progressive) {
				_this.slideshowSelector.classList.add("first-image-loaded");

				var startProgressiveLoad = function startProgressiveLoad() {
					setTimeout(function () {
						_this.progressiveLoad((firstIndex + 1 + _this.total) % _this.total);
					}, _this.settings.delay);
				};

				window.requestAnimationFrame(startProgressiveLoad);
			}
			if (!_this.settings.paused) {
				setTimeout(function () {
					_this.resume();
				}, _this.settings.delay * 0.5 + _this.settings.transition);
			}
		};
		if (!_this.settings.progressive) {
			setTimeout(function () {
				_this.slideshowSelector.classList.add("progressive-loading-disabled");
				_this.kickstart();
			}, 100);
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

		/* Slideshow Buttons */
		const slideshowButtons = _this.slideshowSelector.querySelectorAll("button[class*='heart-'");
		if (slideshowButtons.length === 2) {
			slideshowButtons.forEach(function (button) {
				if (button.classList.contains("heart-next")) {
					button.addEventListener("click", function () {
						if (throttleClick) return;
						_this.pause();
						_this.next(_this, true, false, true);
						throttleClick = setTimeout(function () {
							throttleClick = undefined;
						}, 200);
					});
				} else if (button.classList.contains("heart-prev")) {
					button.addEventListener("click", function () {
						if (throttleClick) return;
						_this.pause();
						_this.previous(_this, true, false, true);
						throttleClick = setTimeout(function () {
							throttleClick = undefined;
						}, 200);
					});
				}
			});
		}

		if (_this.settings.clickToAdvance) {
			var throttleClick;
			var throttleClickResume;
			_this.slideshowSelector.addEventListener(
				"click",
				function () {
					if (throttleClick) return;
					_this.pause();
					_this.next(_this, true, false, true);
					throttleClick = setTimeout(function () {
						throttleClick = undefined;
					}, 400);
					if (!_this.settings.paused) {
						if (throttleClickResume) clearTimeout(throttleClickResume);
						throttleClickResume = setTimeout(function () {
							_this.resume();
						}, _this.settings.transition + _this.settings.delay);
					}
				},
				false
			);
		}

		_this.prevNextHandler = function (targetIndex, indexToProgressiveLoad, isManuallyCalled) {
			// console.log(_this.index, indexToProgressiveLoad);
			if (_this.transitioning === true) {
				if (isManuallyCalled === true) {
					/* This triggers if a manual transition is called during an automatic one*/
					if (_this.manualTimeout) clearTimeout(_this.manualTimeout);
					if (!_this.settings.paused) {
						// _this.manualTimeout = setTimeout(_this.resume(), _this.settings.transition + _this.settings.delay);
					}
					_this.progressiveLoad(indexToProgressiveLoad);
					var skipDefaultTransition = true;
					_this.goToSlide(_this.index, isManuallyCalled, false, skipDefaultTransition);
					return;
				} else {
					// console.log("prevNext triggered automatically?");
					return;
				}
			}

			if (isManuallyCalled === true) {
				_this.progressiveLoad(indexToProgressiveLoad);
			}

			_this.goToSlide(targetIndex, isManuallyCalled, false, false);

			// if (_this.settings.progressive) {
			// setTimeout(function () {
			// 	if (!_this.settings.paused) {
			// 		_this.resume();
			// 	}
			// }, _this.settings.transition + _this.settings.delay);
			// }
			setTimeout(
				function () {
					// console.log("transition is done");
					_this.transitioning = false;
				},
				isManuallyCalled ? 400 : _this.settings.transition
			);
		};
	}

	swipeHandler(_this) {
		this.xDown = null;
		this.yDown = null;

		function getTouches(evt) {
			return evt.touches || evt.originalEvent.touches;
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
				if (xDiff > 0) {
					evt.preventDefault();
					/* Right swipe */
					_this.pause();
					_this.next(_this, true, false, true);
					// setTimeout(_this.resume(), 400);
				} else {
					evt.preventDefault();
					/* Left swipe */
					_this.pause();
					_this.previous(_this, true, false, true);
					// setTimeout(_this.resume(), 400);
				}
			}
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
	goToSlide(targetIndex, isManuallyCalled = false, isFirstSlide = false, skipDefaultTransition = false) {
		/* Check if slides are animating, if so, don't run this again. */
		if (this.transitioning && !skipDefaultTransition) return false;
		// if (this.transitioning && !isManuallyCalled) return;
		// var skipDefaultTransition = targetIndex === this.index && isManuallyCalled;

		/* Set transitioning to true */
		this.transitioning = true;

		/* 
		1) Remove the old active class
		2) Find the new active slide
		3) Add the new active class 
		*/
		var _this = this;
		var oldslide = _this.slides[_this.index];
		var newTargetIndex = (targetIndex + _this.total) % _this.total;
		var newslide = _this.slides[newTargetIndex];
		/* Fade duration */
		var duration = isManuallyCalled || isFirstSlide || skipDefaultTransition ? 400 : _this.settings.transition;

		if (oldslide === newslide && skipDefaultTransition) {
			// console.log(_this.slideInterval);
			// clearInterval(_this.slideInterval);
			// oldslide.style.transitionDelay = 0 + "ms";
			// oldslide.style.transitionDuration = 0 + "ms";
			newslide.style.transitionDuration = duration + "ms";
			newslide.style.transitionDelay = 0 + "ms";
		}

		_this.index = newTargetIndex;

		_this.progressiveLoad(newTargetIndex);
		_this.progressiveLoad((newTargetIndex + 1 + _this.total) % _this.total);

		function changeSlides() {
			// console.log("Go to slide #" + _this.index);

			/* remove styles from old slide */
			if (oldslide !== newslide) {
				oldslide.style.transitionDelay = duration + "ms";
				oldslide.style.transitionDuration = 0 + "ms";
				oldslide.classList.remove("active");
			}

			/* add styles to new slide */
			newslide.style.transitionDelay = 0 + "ms";
			newslide.style.transitionDuration = duration + "ms";
			newslide.removeAttribute("aria-hidden");
			newslide.removeAttribute("tab-index");
			newslide.classList.add("active");

			setTimeout(function () {
				if (!isFirstSlide) {
					oldslide.setAttribute("aria-hidden", "true");
					oldslide.setAttribute("tab-index", "-1");
				}
				_this.transitioning = false;
			}, duration);
		}

		window.requestAnimationFrame(changeSlides);
	}
	progressiveLoad(target, isFirstSlide = false, _this) {
		var currentImages = Array.prototype.slice.call(this.slides[target].querySelectorAll("img"));
		if (currentImages.length > 0) {
			currentImages.forEach((currentImage, index) => {
				if (currentImage == undefined || currentImage.classList.contains("image-loaded") || currentImage.classList.contains("image-loading") || currentImage.currentSrc === null) {
					// console.log("%cSkip loading: " + target, "font-style: italic; font-size: 0.9em; color: red; padding: 0.2em;");
					return;
				} else {
					/* To-Do: Check if image is already loaded, and skip loading function */

					// console.log("%cStart loading: " + target, "font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;");
					currentImage.classList.add("image-loading");
					currentImage.addEventListener("load", function () {
						this.classList.add("image-loaded");
						this.classList.remove("image-loading");
						// console.log("%cFinished loading: " + target, "font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;");
						if (isFirstSlide && index == 0) {
							// start slideshow when finished loading first image
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
				}
			});
		}
	}
	next(_this, isManuallyCalled = false) {
		var nextIndex = (_this.index + 1 + _this.total) % _this.total;
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

		if (_this.settings.paused) {
			_this.settings.paused = false;
		}

		// _this.index = (_this.index + 1 + _this.total) % _this.total;

		var nextSlideIndex = (_this.index + 1 + _this.total) % _this.total;

		if (_this.settings.progressive) {
			setTimeout(function () {
				_this.progressiveLoad((nextSlideIndex + 1 + _this.total) % _this.total);
			}, _this.settings.delay);
		}

		_this.goToSlide(nextSlideIndex);

		this.slideInterval = setInterval(function () {
			_this.next(_this, false);
		}, _this.settings.delay + _this.settings.transition);
	}
	pause() {
		const _this = this;
		if (!_this.settings.paused) {
			_this.settings.paused = true;
			clearTimeout(this.manualTimeout);
			clearInterval(this.slideInterval);
		}
	}
}
/* TO DO */
/* [ ] Make sure slideshow initializes when not using data-src or data-srcset
/* [ ] Optimize paint/render time — reduce number of active layers with display none
 * [ ] Add prev/next callback
 * [ ] Add first image loaded callback
 * [ ] Use JS bind() function instead of using "_this" variable
 * [-] Remove Class format?
 * [-] Better way to manage multiple slideshows
 */
