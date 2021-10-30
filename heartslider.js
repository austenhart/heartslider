/* 
❤  Heartslider  ❤
❤ Version 3.2.7 ❤

=== Steps to Push New Version ===
1) https://babeljs.io/repl#?browsers=defaults
2) https://javascript-minifier.com
3) Update Changelog and version number in .js, min.js, .css and readme.md

=== Changelog ===
3.2.7 - Many QOL improvements; buttons will auto-pause slideshow while click/swipe will not
3.2.6 - Fixed prev/next button selector
3.2.5 - Loop false works again
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
			buttons: false,
			clickToAdvance: false,
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
			const directChildren = this.slideshowSelector.children;
			// this.slides = Array.prototype.slice.apply(this.slideshowSelector.children);
			this.slides = [...directChildren].filter((child) => child.tagName !== "BUTTON");
		}

		/* Setting up scoped variables */
		this.total = this.slides.length;
		this.index = 0;
		this.manualTimeout;
		this.originallyPaused = this.settings.paused;
		// this.transitioning = false;

		/* Start */
		if (this.settings.randomize) this.index = Math.floor(Math.random() * this.total);
		if (this.settings.progressive) this.progressiveLoad(this.index, true, this);

		this.firstIndex = this.index;

		/* Loop through each slide  */
		this.slides.forEach(function (slide, index) {
			if (index !== _this.firstIndex) {
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
		this.goToSlide(this.firstIndex, false, true);

		if (this.slides.length < 2) return false;

		_this.kickstart = function () {
			if (_this.settings.progressive) {
				_this.slideshowSelector.classList.add("first-image-loaded");

				var startProgressiveLoad = function startProgressiveLoad() {
					setTimeout(function () {
						_this.progressiveLoad((_this.firstIndex + 1 + _this.total) % _this.total);
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
					if (!_this.originallyPaused) {
						if (throttleClickResume) clearTimeout(throttleClickResume);
						throttleClickResume = setTimeout(function () {
							_this.resume();
						}, _this.settings.transition + _this.settings.delay * 1.25);
					}
				},
				false
			);
		}

		/* Slideshow Buttons */
		const slideshowButtons = _this.slideshowSelector.querySelectorAll("button[class*='heart-']");
		if (_this.settings.buttons || slideshowButtons.length === 2) {
			function buttonHandler(button) {
				if (throttleClick) return;
				_this.pause();
				if (button.classList.contains("heart-next")) {
					_this.next(_this, true, false, true);
				} else if (button.classList.contains("heart-prev")) {
					_this.previous(_this, true, false, true);
				}
				throttleClick = setTimeout(function () {
					throttleClick = undefined;
				}, 200);
			}
			if (slideshowButtons.length === 0) {
				const buttonClasses = ["heart-prev", "heart-next"];
				for (var i = 0; i < buttonClasses.length; i++) {
					var button = document.createElement("button");
					button.classList.add(buttonClasses[i]);
					button.setAttribute("aria-label", buttonClasses[i].replace("heart-", ""));
					button.setAttribute("tab-index", "0");
					button.addEventListener(
						"click",
						function (e) {
							buttonHandler(e.currentTarget);
						},
						false
					);
					_this.slideshowSelector.appendChild(button);
				}
			} else {
				// loop through slideshowbuttons and add event listeners
				for (const button of slideshowButtons) {
					button.setAttribute("tab-index", "0");
					const ariaLabel = button.classList.contains("heart-prev") ? "prev" : "next";
					button.setAttribute("aria-label", ariaLabel);
					button.addEventListener(
						"click",
						function (e) {
							buttonHandler(e.currentTarget);
						},
						false
					);
				}
			}
		}
		_this.on = function (type, callback) {
			if (typeof callback == "function") {
				callback(_this);
			}
			console.log(type);
			function transitionStart(_this) {
				console.log("transitionStart");
			}
			this.transitionStart = transitionStart;
		};

		_this.prevNextHandler = function (targetIndex, indexToProgressiveLoad, isManuallyCalled) {
			if (_this.transitioning === true) {
				if (isManuallyCalled === true) {
					/* This triggers if a manual transition is called during an automatic one*/
					if (_this.manualTimeout) clearTimeout(_this.manualTimeout);
					if (!_this.originallyPaused) {
						_this.manualTimeout = setTimeout(_this.resume(), _this.settings.transition + _this.settings.delay);
					}
					_this.progressiveLoad(indexToProgressiveLoad);
					var skipDefaultTransition = true;
					_this.goToSlide(_this.index, isManuallyCalled, false, skipDefaultTransition);
					return;
				} else {
					/* prevNext triggered automatically */
					return;
				}
			}

			if (isManuallyCalled === true) {
				_this.progressiveLoad(indexToProgressiveLoad);
			}

			_this.goToSlide(targetIndex, isManuallyCalled, false, false);

			setTimeout(
				function () {
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
		// console.log("goToSlide", targetIndex, "isManuallyCalled: ", isManuallyCalled, "isFirstSlide: ", isFirstSlide, "skipDefaultTransition: ", skipDefaultTransition);
		/* Check if slides are animating, if so, don't run this again. */
		if (this.transitioning && !skipDefaultTransition) return false;

		/* If Loop is set to false, then stop. */
		if (!this.settings.loop && !isFirstSlide && targetIndex === this.firstIndex) {
			this.pause();
			return false;
		}

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

		_this.index = newTargetIndex;

		_this.progressiveLoad(newTargetIndex);
		_this.progressiveLoad((newTargetIndex + 1 + _this.total) % _this.total);

		function changeSlides() {
			/* This part of the function smoothly transitions a skipped fade */
			if (oldslide === newslide && skipDefaultTransition) {
				/* Clear any timeouts that were running */
				clearTimeout(_this.manualTimeout);
				clearInterval(_this.slideInterval);
				/* Get the current opacity and apply it as an inline-style */
				oldslide.style.opacity = window.getComputedStyle(oldslide).opacity;
				/* MUST set transition to none in order to override the css transition */
				oldslide.style.transition = "none";
				/* A moment later (1/60th of a second), give the slide the quick transition durations */
				setTimeout(function () {
					oldslide.style.transition = "opacity";
					oldslide.style.transitionDelay = 0 + "ms";
					oldslide.style.transitionDuration = duration + "ms";
					oldslide.style.opacity = null;
				}, 16.6667);
			} else if (oldslide !== newslide) {
				/* remove styles from old slide */
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

			if (_this.transitionOldSlideTimer) {
				clearTimeout(_this.transitionOldSlideTimer);
			}

			// _this.on.transitionStart(_this);

			_this.transitionOldSlideTimer = setTimeout(function () {
				oldslide.style.transitionDelay = 0 + "ms";
				oldslide.style.transitionDuration = 0 + "ms";
				if (!isFirstSlide) {
					oldslide.setAttribute("aria-hidden", "true");
					oldslide.setAttribute("tab-index", "-1");
				}
				_this.transitioning = false;
				_this.transitionOldSlideTimer = undefined;
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
					// console.log("%cStart loading: " + target, "font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;");
					currentImage.classList.add("image-loading");

					function loadHandler() {
						this.classList.add("image-loaded");
						this.classList.remove("image-loading");
						// console.log("%cFinished loading: " + target, "font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;");
						if (isFirstSlide && index == 0) {
							/* Start slideshow when finished loading first image */
							_this.kickstart();
						}
					}
					if (currentImage.complete && currentImage.naturalWidth > 0) {
						loadHandler.bind(currentImage)();
					} else {
						currentImage.onload = loadHandler.bind(currentImage);
						var atts = ["sizes", "srcset", "src"];
						atts.forEach(function (attribute) {
							var targetAtt = currentImage.getAttribute("data-" + attribute);
							if (targetAtt && currentImage.getAttribute(attribute) == null) {
								currentImage.setAttribute(attribute, targetAtt);
								currentImage.setAttribute("data-" + attribute, "");
							}
						});
					}
				}
			});
		}
	}
	next(_this = this, isManuallyCalled = false) {
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
/* [ ] Use JS bind() function instead of using "_this" variable
 * [–] Make sure slideshow initializes when not using data-src or data-srcset
 * [–] Optimize paint/render time — reduce number of active layers with display none
 * [–] Add prev/next callback
 * [–] Add first image loaded callback
 * [-] Remove Class format?
 * [-] Better way to manage multiple slideshows
 */
