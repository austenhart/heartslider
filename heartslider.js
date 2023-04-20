/* 
❤  Heartslider  ❤
❤ Version 3.4.0 ❤

=== Steps to Push New Version ===
1) https://babeljs.io/repl#?browsers=defaults
2) https://javascript-minifier.com
3) Update Changelog and version number in .js, min.js, .css, readme.md, and package.json

CDN link: https://www.jsdelivr.com/package/gh/austenhart/heartslider

=== Changelog ===
3.4.0 - Added progress indicators
3.3.1 - Fixed issue with custom Events
3.3.0 - Added transitionStart and transitionEnd events
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
			manualTransition: 400,
			paused: false,
			pauseOnInactiveWindow: false,
			progressive: true,
			randomize: false,
			slideshow: ".heart-slideshow",
			slides: ".heart-slide",
			swipe: true,
			transition: 3000,
			progressIndicators: {
				type: "dash", // or "dot"
				showProgress: false,
				clickable: true,
				color: "#fff",
			},
		};

		/* Overwrite defaults with user-defined settings */
		for (var prop in userSettings) {
			if (this.settings.hasOwnProperty(prop)) {
				if (typeof userSettings[prop] === "object") {
					// Loop through each sub-property
					for (const subProp in userSettings[prop]) {
						// Re-assign defaults based on user settings
						const value = userSettings[prop][subProp];
						if (this.settings[prop].hasOwnProperty(subProp)) {
							this.settings[prop][subProp] = value;
						}
					}
				} else {
					this.settings[prop] = userSettings[prop];
				}
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
				function (event) {
					if (throttleClick || event.target.nodeName === "BUTTON") return;
					_this.pause();
					_this.next(_this, true, false, true);
					throttleClick = setTimeout(function () {
						throttleClick = undefined;
					}, _this.settings.manualTransition);
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

		/* Progress Indicators */
		if (this.settings.progressIndicators) {
			// create the indicator containing div
			const progressContainer = document.createElement("div");
			progressContainer.classList.add("progress-container");
			// Give it either a Dash or Dot style
			const type = this.settings.progressIndicators.type || "dash";
			progressContainer.classList.add("type-" + type);
			// Show progress or not
			const showProgress = this.settings.progressIndicators.showProgress;
			if (showProgress) {
				progressContainer.classList.add("show-progress");
			}
			// progressContainer.classList.add("type-" + type);
			// Create CSS variable for custom color
			const indicatorColor = this.settings.progressIndicators.color || "#fff";
			if (indicatorColor !== "#fff" || indicatorColor !== "#ffffff" || indicatorColor !== "white" || indicatorColor !== "rgb(255, 255, 255)" || indicatorColor !== "rgba(255, 255, 255, 1)") {
				progressContainer.style.setProperty("--indicator-color", indicatorColor);
			}
			// Clickable? Then create a button. Otherwise, just a div.
			const indicatorType = this.settings.progressIndicators.clickable ? "button" : "div";
			// fill it with the appropriate number of markers
			for (let index = 0; index < this.total; index++) {
				const indicator = document.createElement(indicatorType);
				indicator.classList.add("indicator");
				// if (index === _this.firstIndex) {
				// 	indicator.classList.add("active");
				// }
				indicator.setAttribute("data-index", index);
				indicator.addEventListener("click", (event) => {
					_this.pause();
					_this.goToSlide(index, true, false, true);
					// setTimeout(() => {
					// 	_this.resume();
					// }, 4000);
				});
				progressContainer.appendChild(indicator);
			}
			this.slideshowSelector.appendChild(progressContainer);
			this.progressContainerSelector = progressContainer;
			this.progressIndicators = progressContainer.querySelectorAll(".indicator");
			window.requestAnimationFrame(() => {
				this.progressIndicators[this.firstIndex].classList.add("active", "first");
			});
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
	}
	kickstart() {
		const _this = this;
		if (_this.settings.progressive) {
			_this.slideshowSelector.classList.add("first-heart-image-loaded");

			var startProgressiveLoad = function startProgressiveLoad() {
				setTimeout(function () {
					_this.progressiveLoad((_this.firstIndex + 1 + _this.total) % _this.total);
				}, _this.settings.delay);
			};

			window.requestAnimationFrame(startProgressiveLoad);
		}
		if (!_this.settings.paused) {
			_this.kickoffTimer = setTimeout(function () {
				_this.resume();
				_this.kickoffTimer = undefined;
			}, _this.settings.delay * 0.5 + _this.settings.transition);
		}
	}
	on(type, callback) {
		const _this = this;
		const supportedEvents = ["transitionStart", "transitionEnd"];
		if (supportedEvents.includes(type)) {
			if (typeof callback === "function") {
				function callbackHandler(_this) {
					let event = new CustomEvent(type, {
						detail: {
							slideshow: _this,
						},
					});
					_this.slideshowSelector.dispatchEvent(event);
					callback(event.detail.slideshow, event.detail.slideshow.slideshowSelector, event.detail.slideshow.currentSlide);
				}
				if (type === "transitionStart") {
					_this.transitionStart = function (_this) {
						callbackHandler(_this);
					};
				}
				if (type === "transitionEnd") {
					_this.transitionEnd = function (_this) {
						callbackHandler(_this);
					};
				}
			} else {
				console.warn("Your second argument for " + type + " must be a function.");
			}
		} else {
			console.warn("\x22" + type + "\x22 is not a valid event. Try one of these:", supportedEvents);
		}
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
				} else {
					evt.preventDefault();
					/* Left swipe */
					_this.pause();
					_this.previous(_this, true, false, true);
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
		// Trying to figure out why my skipDefaultTransition isn't working anymore. If statements??
		// console.log({ targetIndex }, { isManuallyCalled }, { isFirstSlide }, { skipDefaultTransition });
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
		this.previousSlide = this.slides[this.index];
		var newTargetIndex = (targetIndex + this.total) % this.total;
		this.currentSlide = this.slides[newTargetIndex];

		/* Update Progress Indicators */
		const progressContainerSelector = this.progressContainerSelector;
		const progressIndicators = this.progressIndicators;

		if (progressContainerSelector !== undefined && progressIndicators.length > 0) {
			const activeIndicator = progressIndicators[newTargetIndex];
			const alreadyActiveIndicators = progressContainerSelector.querySelectorAll(".active");
			for (const activeIndicator of alreadyActiveIndicators) {
				activeIndicator.classList.remove("active", "first");
			}
			activeIndicator.classList.add("active");
		}

		/* Fade duration */
		var duration = isManuallyCalled || isFirstSlide || skipDefaultTransition ? _this.settings.manualTransition : _this.settings.transition;

		this.index = newTargetIndex;

		this.progressiveLoad(newTargetIndex);
		this.progressiveLoad((newTargetIndex + 1 + _this.total) % _this.total);

		function changeSlides() {
			let prevSlideProgress = 1;
			/* This part of the function smoothly transitions a skipped fade */
			if (_this.previousSlide === _this.currentSlide && skipDefaultTransition) {
				/* Clear any timeouts that were running */
				clearTimeout(_this.manualTimeout);
				clearInterval(_this.slideInterval);
				/* Get the current opacity and apply it as an inline-style */
				const prevSlideOpacity = window.getComputedStyle(_this.previousSlide).opacity;
				prevSlideProgress = 1 - prevSlideOpacity;
				_this.previousSlide.style.opacity = prevSlideOpacity;
				/* MUST set transition to none in order to override the css transition */
				_this.previousSlide.style.transition = "none";
				/* A moment later (1/60th of a second), give the slide the quick transition durations */
				setTimeout(function () {
					_this.previousSlide.style.transition = "opacity";
					_this.previousSlide.style.transitionDelay = 0 + "ms";
					_this.previousSlide.style.transitionDuration = duration * prevSlideProgress + "ms";
					_this.previousSlide.style.opacity = null;
				}, 16.6667);
			} else if (_this.previousSlide !== _this.currentSlide) {
				/* remove styles from old slide */
				_this.previousSlide.style.transitionDelay = duration + "ms";
				_this.previousSlide.style.transitionDuration = 0 + "ms";
				_this.previousSlide.classList.remove("active");
			}

			/* add styles to new slide */
			_this.currentSlide.style.transitionDelay = 0 + "ms";
			_this.currentSlide.style.transitionDuration = duration + "ms";
			_this.currentSlide.removeAttribute("aria-hidden");
			_this.currentSlide.removeAttribute("tab-index");
			_this.currentSlide.classList.add("active");

			if (_this.transitionEndTimer) {
				clearTimeout(_this.transitionEndTimer);
			}

			/* Should this be called on first slide, or not? */
			// if (!isFirstSlide) {
			if (_this.transitionStart) {
				_this.transitionStart(_this);
			}
			// }

			_this.transitionEndTimer = setTimeout(function () {
				_this.previousSlide.style.transitionDelay = 0 + "ms";
				_this.previousSlide.style.transitionDuration = 0 + "ms";
				if (!isFirstSlide) {
					_this.previousSlide.setAttribute("aria-hidden", "true");
					_this.previousSlide.setAttribute("tab-index", "-1");
					if (_this.transitionEnd) {
						_this.transitionEnd(_this);
					}
				}
				_this.transitioning = false;
				_this.transitionEndTimer = undefined;
			}, duration * prevSlideProgress);
		}
		window.requestAnimationFrame(changeSlides);
	}
	progressiveLoad(target, isFirstSlide = false, _this) {
		var currentImages = Array.prototype.slice.call(this.slides[target].querySelectorAll("img"));
		if (currentImages.length > 0) {
			currentImages.forEach((currentImage, index) => {
				if (currentImage == undefined || currentImage.classList.contains("heart-image-loaded") || currentImage.classList.contains("heart-image-loading") || currentImage.currentSrc === null) {
					// console.log("%cSkip loading: " + target, "font-style: italic; font-size: 0.9em; color: red; padding: 0.2em;");
					return;
				} else {
					// console.log("%cStart loading: " + target, "font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;");
					currentImage.classList.add("heart-image-loading");

					function loadHandler() {
						this.classList.add("heart-image-loaded");
						this.classList.remove("heart-image-loading");
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
		var currentVideos = Array.prototype.slice.call(this.slides[target].querySelectorAll("video"));
		if (currentVideos.length > 0) {
			currentVideos.forEach((currentVideo, index) => {
				console.log(currentVideo);
			});
		}
	}
	prevNextHandler(targetIndex, indexToProgressiveLoad, isManuallyCalled) {
		const _this = this;
		if (_this.transitioning === true) {
			if (isManuallyCalled === true) {
				/* This triggers if a manual transition is called during an automatic one*/
				if (_this.manualTimeout) clearTimeout(_this.manualTimeout);
				if (!_this.originallyPaused) {
					_this.manualTimeout = setTimeout(_this.resume(), _this.settings.transition + _this.settings.delay);
				}
				_this.progressiveLoad(indexToProgressiveLoad);
				var skipDefaultTransition = true;

				let isFirstSlide = false; // ?
				_this.goToSlide(_this.index, isManuallyCalled, isFirstSlide, skipDefaultTransition);
				// _this.goToSlide(_this.index, isManuallyCalled, false, false, skipDefaultTransition);
				return;
			} else {
				/* prevNext triggered automatically */
				return;
			}
		}

		if (isManuallyCalled === true) {
			_this.progressiveLoad(indexToProgressiveLoad);
		}

		// console.log("calling goToSlide on 472");
		_this.goToSlide(targetIndex, isManuallyCalled, false, skipDefaultTransition);

		setTimeout(
			function () {
				_this.transitioning = false;
			},
			isManuallyCalled ? _this.settings.manualTransition : _this.settings.transition
		);
	}
	next = function (_this = this, isManuallyCalled = false) {
		var nextIndex = (_this.index + 1 + _this.total) % _this.total;
		var indexToProgressiveLoad = (nextIndex + 1 + _this.total) % _this.total;

		_this.prevNextHandler(nextIndex, indexToProgressiveLoad, isManuallyCalled);
	};
	previous = function (_this = this, isManuallyCalled = false) {
		var previousIndex = (_this.index - 1 + _this.total) % _this.total;
		var indexToProgressiveLoad = previousIndex;

		_this.prevNextHandler(previousIndex, indexToProgressiveLoad, isManuallyCalled);
	};
	resume = function (_this = this) {
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
	};
	/* Move to public functions */
	pause = function (_this = this) {
		if (!_this.settings.paused) {
			_this.settings.paused = true;
			clearTimeout(this.manualTimeout);
			clearTimeout(this.kickoffTimer);
			clearInterval(this.slideInterval);
		}
	};
}
/* TO DO */
/* [ ] Implement bundler and minification
 * [ ] Fix issue with previous button during transition
 * [ ] Re-arrange public vs private methods
 * [ ] Use JS bind() function instead of using "_this" variable
 * [–] Make sure slideshow initializes when not using data-src or data-srcset
 * [–] Optimize paint/render time — reduce number of active layers with display none
 * [–] Add prev/next callback
 * [–] Add first image loaded callback
 * [-] Remove Class format?
 * [-] Better way to manage multiple slideshows
 */
