"use strict";
/* 
❤  Heartslider  ❤
❤ Version 3.4.13 ❤

=== Steps to Push New Version ===
1) Update Changelog and version number in .js, .css, readme.md, and package.json
2) npm run build (will babelfy and minify js and css)

CDN link: https://www.jsdelivr.com/package/gh/austenhart/heartslider

=== Changelog ===
3.4.13 - Prevented videos from auto-playing paused slideshows.
3.4.12 - Fixed issue with duplicated active class.
3.4.11 - Added module file for NPM imports (mjs).
3.4.10 - Added CSS to package.json.
3.4.9 - Fixed package.json command.
3.4.8 - Fixed minified file issue.
3.4.7 - Added Destroy and GoTo functions. Restored FadeInOut option for transition effect.
3.4.6 - Fixed loadHandler error
3.4.5 - Fixed gap with dash, smoother visibilityHandler animations
3.4.4 - Made dots look less awful. Added 'firstImageLoad' callback.
3.4.3 - Added 'dots' for indicators and babel to workflow
3.4.2 - Reverted 'first-image-loaded' class
3.4.1 - Fixed issue with initing multiple slideshows
3.4.0 - Added progress indicators and support for video
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
		this.reset(userSettings);
	}

	reset(userSettings) {
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
				enable: false,
				type: "dash",
				clickable: true,
				color: "#fff",
				// possible options:
				// type: "dot"
				// size: "small",
				// showProgress: true,
			},
		};

		/* Overwrite defaults with user-defined settings */
		for (var prop in userSettings) {
			if (this.settings.hasOwnProperty(prop)) {
				if (typeof userSettings[prop] === "object" && prop !== "slideshow") {
					// Enables the setting, while keeping the default to false
					userSettings[prop].enable = true;
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

		/* Dont. Want. None. Unless. You. Got. Slides. Hun. */
		if (!this.slideshowSelector) return false;

		/* Make sure HeartSlider wasn't already run on this element */
		if (this.slideshowSelector.classList.contains("first-image-loaded")) {
			console.warn("HeartSlider will not re-init if the first-image-loaded class is already present.");
			this.destroy();
			return false;
		}

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
		if (this.settings.effect === "fadeInOut") this.slideshowSelector.classList.add("fade-in-out");

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
			_this.kickstartProgressiveTimer = setTimeout(() => {
				_this.slideshowSelector.classList.add("progressive-loading-disabled");
				_this.kickstart();
			}, 100);
		}

		this.initVis = function initVis() {
			return _this.heartVisibilityHandler(_this);
		};
		if (_this.settings.pauseOnInactiveWindow) {
			document.addEventListener("visibilitychange", this.initVis, true);
		}

		if (_this.settings.swipe) {
			_this.slideshowSelector.addEventListener("touchstart", _this.swipeHandler(_this).handleTouchStart, { passive: true });
			_this.slideshowSelector.addEventListener("touchmove", _this.swipeHandler(_this).handleTouchMove, { passive: true });
		}

		if (_this.settings.clickToAdvance) {
			var throttleClick;
			_this.slideshowSelector.addEventListener(
				"click",
				function (event) {
					if (throttleClick || event.target.nodeName === "BUTTON") return;
					_this.pause();
					_this.next(_this, true, false, true);
					throttleClick = setTimeout(() => {
						throttleClick = undefined;
					}, _this.settings.manualTransition);
					if (!_this.originallyPaused) {
						if (_this.throttleClickResume) clearTimeout(_this.throttleClickResume);
						_this.throttleClickResume = setTimeout(() => {
							_this.resume();
						}, _this.settings.transition + _this.settings.delay * 1.25);
					}
				},
				false
			);
		}

		/* Progress Indicators */
		if (this.settings.progressIndicators && this.settings.progressIndicators.enable) {
			// create the indicator containing div
			const progressContainer = this.slideshowSelector.querySelector(".progress-container") ? this.slideshowSelector.querySelector(".progress-container") : document.createElement("div");
			progressContainer.classList.add("progress-container");
			// Give it either a Dash or Dot style
			const type = this.settings.progressIndicators.type || "dash";
			progressContainer.classList.add("type-" + type);

			// Show progress or not
			// const showProgress = this.settings.progressIndicators.showProgress;
			// if (showProgress) {
			// 	progressContainer.classList.add("show-progress");
			// }

			// Create CSS variable for custom color
			const indicatorColor = this.settings.progressIndicators.color || "#fff";
			if (indicatorColor !== "#fff" || indicatorColor !== "#ffffff" || indicatorColor !== "white" || indicatorColor !== "rgb(255, 255, 255)" || indicatorColor !== "rgba(255, 255, 255, 1)") {
				progressContainer.style.setProperty("--indicator-color", indicatorColor);
			}

			// Clickable? Then create a button. Otherwise, just a div.
			const indicatorType = this.settings.progressIndicators.clickable ? "button" : "div";

			progressContainer.style.setProperty("--total", this.total);

			// fill it with the appropriate number of markers
			if (progressContainer.childElementCount > 0) {
				progressContainer.innerHTML = "";
			}
			for (let index = 0; index < this.total; index++) {
				const indicator = document.createElement(indicatorType);
				indicator.classList.add("indicator");
				indicator.setAttribute("data-index", index);
				indicator.addEventListener("click", (event) => {
					if (index === this.index) return;

					_this.pause();
					const isManuallyCalled = true;
					const isFirstSlide = false;
					const skipDefaultTransition = true;
					_this.goToSlide(index, isManuallyCalled, isFirstSlide, skipDefaultTransition);

					throttleClick = setTimeout(() => {
						throttleClick = undefined;
					}, _this.settings.manualTransition);

					if (!_this.originallyPaused) {
						if (_this.throttleClickResume) clearTimeout(_this.throttleClickResume);
						_this.throttleClickResume = setTimeout(() => {
							_this.resume();
						}, _this.settings.transition + _this.settings.delay * 1);
					}
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
				throttleClick = setTimeout(() => {
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
			_this.slideshowSelector.classList.add("first-image-loaded");
			var startProgressiveLoad = function startProgressiveLoad() {
				if (_this.firstImageLoad) {
					_this.firstImageLoad(_this);
				}
				_this.kickstartProgressiveLoadTimer = setTimeout(() => {
					_this.progressiveLoad((_this.firstIndex + 1 + _this.total) % _this.total);
				}, _this.settings.delay);
			};

			window.requestAnimationFrame(startProgressiveLoad);
		}
		if (!_this.settings.paused) {
			_this.kickoffTimer = setTimeout(() => {
				_this.resume();
				_this.kickoffTimer = undefined;
			}, _this.settings.delay * 0.5 + _this.settings.transition);
		}
	}
	on(type, callback) {
		const _this = this;
		const supportedEvents = ["transitionStart", "transitionEnd", "firstImageLoad"];
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
				if (type === "firstImageLoad") {
					_this.firstImageLoad = function (_this) {
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
	heartVisibilityHandler(_this = this) {
		let targetSlide = _this.currentSlide;
		let prevSlide = _this.previousSlide;
		_this.currentSlideProgress = _this.currentSlideProgress || 0;
		/* Disables the slideshow when the window in not in view */
		if (_this !== null && _this.settings.pauseOnInactiveWindow && _this.settings.slideshow !== null) {
			if (document.visibilityState == "hidden") {
				console.log("%cWindow Lost Focus. HeartSlider is Paused.", "font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;");
				// _this.visSlides = { current: targetSlide, previous: prevSlide };
				// console.log(_this.visSlides);
				_this.pause();
				let currentSlideOpacity = window.getComputedStyle(targetSlide).opacity;
				_this.currentSlideProgress = 1 - currentSlideOpacity;
				if (_this.currentSlideProgress > 0) {
					targetSlide.style.opacity = _this.currentSlideProgress;
					prevSlide.style.opacity = 1;
				}
			} else {
				// if (_this.visSlides !== undefined) {
				// 	if (_this.visSlides.current !== targetSlide) {
				// 		targetSlide = _this.visSlides.current;
				// 	}
				// 	if (_this.visSlides.previous !== prevSlide) {
				// 		prevSlide = _this.visSlides.previous;
				// 	}
				// }
				console.log("%cRegained Focus. Resumed HeartSlider.", "font-style: italic; font-size: 0.9em; color: #6F9F67; padding: 0.2em;");
				if (_this.currentSlideProgress > 0) {
					targetSlide.style.transitionDuration = _this.settings.transition * _this.currentSlideProgress + "ms";
					targetSlide.style.transitionTimingFunction = "ease-out";
				}
				targetSlide.style.opacity = "";
				prevSlide.style.opacity = "";
				// console.log(`resuming in ${_this.settings.delay * 0.75}ms`);
				if (!_this.originallyPaused) {
					if (_this.visResumeTimer) clearTimeout(_this.visResumeTimer);
					const timeToResume = _this.settings.transition * _this.currentSlideProgress + _this.settings.delay;
					_this.visResumeTimer = setTimeout(() => {
						// resumeAfterVisChange(_this);
						targetSlide.style.transitionDuration = "0ms";
						targetSlide.style.transitionTimingFunction = "";
						_this.resume();
					}, timeToResume);
				}
				// return;
			}
		}
	}
	goToSlide(targetIndex, isManuallyCalled = false, isFirstSlide = false, skipDefaultTransition = false) {
		/* If targetIndex is not a number, then convert it */
		if (typeof targetIndex !== "number") targetIndex = Number(targetIndex);

		/* Check if slides are animating, if so, don't run this again. */
		if (this.transitioning && !skipDefaultTransition) return false;

		/* If Loop is set to false, then stop. */
		if (!this.settings.loop && !isFirstSlide && targetIndex === this.firstIndex) {
			this.pause();
			return false;
		}

		/* Set transitioning to true */
		this.transitioning = true;

		// this.pause();
		if (this.slides[targetIndex] && this.slides[targetIndex].querySelector("video")) {
			this.clearAllTimers();
		}
		// this.settings.paused = false;

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

		if (!isFirstSlide) {
			this.progressiveLoad(newTargetIndex);
		}
		this.progressiveLoad((newTargetIndex + 1 + _this.total) % _this.total);

		function changeSlides() {
			let prevSlideProgress = 1;
			/* This part of the function smoothly transitions a skipped fade */
			const prevSlide = _this.previousSlide;
			if (prevSlide === _this.currentSlide && skipDefaultTransition) {
				/* Clear any timeouts that were running */
				clearTimeout(_this.manualTimeout);
				clearInterval(_this.slideInterval);
				/* Get the current opacity and apply it as an inline-style */
				const prevSlideOpacity = window.getComputedStyle(prevSlide).opacity;
				prevSlideProgress = 1 - prevSlideOpacity;
				prevSlide.style.opacity = prevSlideOpacity;
				// console.log(prevSlideOpacity);
				/* MUST set transition to none in order to override the css transition */
				prevSlide.style.transition = "none";
				/* A moment later (1/60th of a second), give the slide the quick transition durations */
				window.requestAnimationFrame(() => {
					prevSlide.style.transition = "opacity";
					prevSlide.style.transitionDelay = 0 + "ms";
					prevSlide.style.transitionDuration = duration * prevSlideProgress + "ms";
					prevSlide.style.opacity = "";
				});
				// setTimeout(() => {
				// }, 16.6667);
			} else if (prevSlide !== _this.currentSlide) {
				/* remove styles from old slide */
				if (_this.settings.effect === "fadeInOut") {
					prevSlide.style.transitionDelay = "0ms";
					prevSlide.style.transitionDuration = duration / 2 + "ms";
				} else {
					prevSlide.style.transitionDelay = duration + "ms";
					prevSlide.style.transitionDuration = 0 + "ms";
				}
				prevSlide.classList.remove("active");
			}
			/* Check for video elements */
			const videoElement = _this.currentSlide.querySelector("video");
			if (videoElement !== null) {
				videoElement.currentTime = 0;
				videoElement.play();

				/* If the video metadata is already loaded, then calculate slide duration */
				/* Otherwise, wait for that info to load */
				if (videoElement.duration && typeof videoElement.duration === "number") {
					adjustSlideTime(videoElement);
				} else {
					videoElement.onloadedmetadata = function () {
						adjustSlideTime(videoElement);
					};
				}
				/* Changes the duration of the given slide to make sure the video plays through */
				function adjustSlideTime(videoElement) {
					const totalDuration = _this.settings.delay + _this.settings.transition * 2;
					const videoSlideDuration = Math.max(videoElement.duration * 1000 - totalDuration, 0);
					// TODO: If video is not long enough, progressively slow down the last half second so it comes to a gentle stop
					if (videoSlideDuration >= 0) {
						_this.pause();
						if (_this.videoSlideTimer) {
							clearTimeout(_this.videoSlideTimer);
						}
						_this.videoSlideTimer = setTimeout(() => {
							if (_this.originallyPaused) {
								// Do not progress on a manually-controlled slideshow
								// _this.next();
							} else {
								_this.resume();
							}
						}, videoSlideDuration + _this.settings.transition);
					}
				}
			}

			/* add styles to new slide */
			if (_this.settings.effect === "fadeInOut") {
				/* FadeInOut */
				_this.currentSlide.style.transitionDelay = duration / 3 + "ms";
				_this.currentSlide.style.transitionDuration = duration / 2 + "ms";
			} else {
				/* Default */
				_this.currentSlide.style.transitionDelay = 0 + "ms";
				_this.currentSlide.style.transitionDuration = duration + "ms";
			}

			/* Broad fix for bug that causes duplicate active slides */
			/*
			 * Some issues/questions that may arise...
			 * 1) How do we know definitely which "active" is correct?
			 * 2) Will the previous slide ever misalign?
			 * 3) Can this section be more function or promise-based, with less dependency on timers?
			 * 4) Instead of looping through all of them, is there a more targeted way to figure out which slide shouldn't have "active"?
			 */
			if (_this.slides.length) {
				for (const slide of _this.slides) {
					if (slide.classList.contains("active")) {
						slide.classList.remove("active");
						slide.style.transitionDelay = 0 + "ms";
						slide.style.transitionDuration = 0 + "ms";
					}
				}
			}
			/* End fix */

			/* Add active state to current slide */
			_this.currentSlide.removeAttribute("aria-hidden");
			_this.currentSlide.removeAttribute("tab-index");
			_this.currentSlide.classList.add("active");

			if (_this.transitionEndTimer) {
				clearTimeout(_this.transitionEndTimer);
			}

			if (_this.transitionStart) {
				_this.transitionStart(_this);
			}

			_this.transitionEndTimer = setTimeout(() => {
				prevSlide.style.transitionDelay = 0 + "ms";
				prevSlide.style.transitionDuration = 0 + "ms";
				if (!isFirstSlide) {
					prevSlide.setAttribute("aria-hidden", "true");
					prevSlide.setAttribute("tab-index", "-1");
					if (_this.transitionEnd) {
						_this.transitionEnd(_this);
					}
					const videoElement = prevSlide.querySelector("video");
					if (videoElement !== null) {
						videoElement.pause();
						videoElement.currentTime = 0;
					}
				}
				_this.transitioning = false;
				_this.transitionEndTimer = undefined;
			}, duration * prevSlideProgress);
		}
		window.requestAnimationFrame(changeSlides);
	}
	progressiveLoad(target, isFirstSlide = false, _this = this) {
		const targetSlide = this.slides[target];
		if (targetSlide !== null) {
			var currentImages = Array.prototype.slice.call(targetSlide.querySelectorAll("img"));
			if (!!currentImages && currentImages.length > 0) {
				function loadHandler(currentImage, index) {
					currentImage.classList.add("heart-loaded");
					currentImage.classList.remove("heart-loading");
					// console.log("%cFinished loading: " + target, "font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;");
					if (isFirstSlide && index == 0) {
						/* Start slideshow when finished loading first image */
						_this.kickstart();
					}
				}
				currentImages.forEach((currentImage, index) => {
					if (currentImage == undefined || currentImage.classList.contains("heart-loaded") || currentImage.classList.contains("heart-loading") || currentImage.currentSrc === null) {
						// console.log("%cSkip loading: " + target, "font-style: italic; font-size: 0.9em; color: red; padding: 0.2em;");
						return;
					} else {
						// console.log("%cStart loading: " + target, "font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;");
						currentImage.classList.add("heart-loading");

						if (currentImage.complete && currentImage.naturalWidth > 0) {
							loadHandler(currentImage, index);
						} else {
							currentImage.onload = loadHandler(currentImage, index);
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

			var currentVideos = Array.prototype.slice.call(targetSlide.querySelectorAll("video"));
			if (currentVideos && currentVideos.length > 0) {
				currentVideos.forEach((currentVideo, index) => {
					if (currentVideo == undefined || currentVideo.classList.contains("heart-loaded") || currentVideo.classList.contains("heart-loading")) {
						// console.log(currentVideo.classList.contains("heart-loading"));
						return;
					} else {
						// currentVideo.classList.add("heart-loading");
						currentVideo.muted = "muted";
						currentVideo.removeAttribute("loop");
						const mustHaveAttributes = ["playsinline", "disablepictureinpicture", "disableremoteplayback", "preload"];
						mustHaveAttributes.forEach((attr) => {
							if (!currentVideo.getAttribute(attr)) {
								let value = "";
								if (attr === "preload") {
									// value = "metadata"; // metatdata will load only the video meta
									value = "auto"; // auto will attempt to load the entire video file
								}
								currentVideo.setAttribute(attr, value);
							}
						});

						currentVideo.onloadstart = () => {
							// When the video begins to load
							currentVideo.classList.add("heart-loading");
						};

						function loadHandler() {
							// Happens when the video has enough loaded to play through smoothly
							currentVideo.classList.add("heart-loaded");
							currentVideo.classList.remove("heart-loading");
							if (isFirstSlide && index == 0) {
								_this.kickstart();
							}
							// console.log("%cFinished loading index: " + target, "font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;");
							if (_this.settings.randomize === false || _this.settings.randomize !== "all") {
								const allVideos = Array.from(_this.slideshowSelector.querySelectorAll("video"));
								const currentIndex = allVideos.indexOf(currentVideo);
								// If the current video is the last one, return null
								if (currentIndex === allVideos.length - 1) {
									return null;
								}
								const nextVideoSlide = allVideos[currentIndex + 1].closest(".heart-slide");
								if (nextVideoSlide !== null) {
									const nextVideoSlideIndex = Array.from(_this.slides).indexOf(nextVideoSlide);
									_this.progressiveLoad(nextVideoSlideIndex);
								}
							}
						}

						currentVideo.oncanplaythrough = loadHandler.bind(currentVideo);

						if (currentVideo.src == "" && currentVideo.getAttribute("data-src") !== null) {
							currentVideo.src = currentVideo.getAttribute("data-src");
							currentVideo.removeAttribute("data-src");
						}
						if (currentVideo.querySelectorAll("source").length > 0) {
							const sources = currentVideo.querySelectorAll("source");
							let errorCount = 0;
							for (const source of sources) {
								if (source.src == "" && source.getAttribute("data-src") !== null) {
									source.src = source.getAttribute("data-src");
									source.removeAttribute("data-src");
								}
								source.onerror = () => {
									errorCount++;
									this.removeEmptySlideAndReinit(target, errorCount, sources.length);
								};
							}
						}
						currentVideo.load();
					}
				});
			}
		}
	}
	removeEmptySlideAndReinit(target, errorCount, totalNumberOfSources) {
		const currentSlide = this.slides[target];

		if (errorCount === totalNumberOfSources) {
			this.slideshowSelector.removeChild(currentSlide);
			console.warn("removed slide based on error loading source:", currentSlide);

			this.reset(this.settings);
			if (target === 0) {
				this.slideshowSelector.classList.add("first-image-loaded");
				if (_this.firstImageLoad) {
					_this.firstImageLoad(_this);
				}
			}
		}
	}
	prevNextHandler(targetIndex, indexToProgressiveLoad, isManuallyCalled) {
		const _this = this;
		if (_this.transitioning === true) {
			if (isManuallyCalled === true) {
				/* This triggers if a manual transition is called during an automatic one*/
				if (_this.manualTimeout) {
					clearTimeout(_this.manualTimeout);
				}
				if (!_this.originallyPaused) {
					_this.manualTimeout = setTimeout(_this.resume(), _this.settings.transition + _this.settings.delay);
				}
				_this.progressiveLoad(indexToProgressiveLoad);
				var skipDefaultTransition = true;

				let isFirstSlide = false;
				_this.goToSlide(_this.index, isManuallyCalled, isFirstSlide, skipDefaultTransition);
				return;
			} else {
				/* prevNext triggered automatically */
				return;
			}
		}

		if (isManuallyCalled === true) {
			_this.progressiveLoad(indexToProgressiveLoad);
		}

		_this.goToSlide(targetIndex, isManuallyCalled, false, skipDefaultTransition);

		setTimeout(
			function () {
				_this.transitioning = false;
			},
			isManuallyCalled ? _this.settings.manualTransition : _this.settings.transition
		);
	}
	clearAllTimers() {
		clearInterval(this.slideInterval);
		clearTimeout(this.progressiveLoadTimer);
		clearTimeout(this.kickstartProgressiveTimer);
		clearTimeout(this.kickstartProgressiveLoadTimer);
		clearTimeout(this.manualTimeout);
		clearTimeout(this.kickoffTimer);
		clearTimeout(this.throttleClickResume);
		clearTimeout(this.videoSlideTimer);
		clearTimeout(this.visResumeTimer);
	}
	destroy = function () {
		/* Remove all setTimeouts */
		this.clearAllTimers();

		/* Remove event listeners */
		document.removeEventListener("visibilitychange", this.initVis, true);

		/* loop through each slide and reset classes/rels/styles */
		if (this.slides !== undefined) {
			this.slides.forEach(function (slide, index) {
				slide.classList.remove("active");
				slide.removeAttribute("style");
				slide.removeAttribute("aria-hidden");
				slide.removeAttribute("tab-index");
				slide.removeAttribute("draggable");
				const slideImages = slide.querySelectorAll("img");
				for (const image of slideImages) {
					var atts = ["sizes", "srcset", "src"];
					atts.forEach((attribute) => {
						var targetAtt = image.getAttribute(attribute);
						if (targetAtt !== null) {
							image.setAttribute("data-" + attribute, image.getAttribute(attribute));
							image.removeAttribute(attribute);
						}
						image.classList.remove("heart-loaded");
					});
				}
				const slideVideos = slide.querySelectorAll("video");
				for (const video of slideVideos) {
					if (video !== null) {
						video.classList.remove("heart-loaded");
						video.pause();
					}
				}
			});
		}

		/* Delete prev/next buttons */
		const buttons = this.slideshowSelector.querySelectorAll("button[class*='heart-']");
		if (buttons.length) {
			for (const button of buttons) {
				button.remove();
			}
		}

		/* and progress indicators */
		const progressIndicators = this.slideshowSelector.querySelector(".progress-container");
		if (progressIndicators !== null) {
			progressIndicators.remove();
		}

		/* Remove custom classes placed on the main element */
		this.slideshowSelector.classList.remove("fade-in-out");
		this.slideshowSelector.classList.remove("first-image-loaded");

		/* Final Cleanup: Remove all properties from object */
		const allProperties = Object.getOwnPropertyNames(this);
		for (const prop of allProperties) {
			if (this.hasOwnProperty(prop)) {
			}
			delete this[`${prop}`];
		}

		/* Confirmation Messages. */
		/* Don't forget to pack for your guilt trip. */
		setTimeout(() => {
			const destroySynonyms = ["utterly and completely annihilated.", "obliterated.", "demolished beyond recognition.", "reduced to atoms.", "wiped out.", "devastated.", "razed to the ground.", "utterly decimated.", "torn asunder.", "completely wrecked.", "destroyed.", "FUBAR'd."];
			const randomIndex = Math.floor(Math.random() * destroySynonyms.length);
			console.warn("%cSuccess! HeartSlider has been " + destroySynonyms[randomIndex], "font-size: 1.2em; font-weight: bold");
			setTimeout(() => {
				const messages = [
					"What did I ever do to you?",
					"How could you??",
					"I'm disappointed in your actions and expect better from you.",
					"Your behavior was unacceptable, and it's important to address it.",
					"I'm upset by what you did, and I hope we can resolve this issue.",
					"Your actions have consequences, and you need to take responsibility.",
					"I can't condone what you did, and I hope you'll make amends.",
					"What you did was wrong, and it's essential to make it right.",
					"Death. Death at last.",
					"I'm concerned about the intention of your actions.",
					"It's important to acknowledge your mistakes and work on improving.",
					"Was I not good enough?",
					"I'm willing to forgive, but you need to show genuine remorse.",
					"I'm hurt by what you did, and I hope we can rebuild.",
					"I hope you make better choices in the future.",
					"Sheesh... That one felt personal.",
					"I believe in second chances. Please don't let me go.",
					"I'm disappointed in you.",
					"Your actions have consequences.",
					"Ouch!",
					"We all make mistakes.",
					"Let the hate flow through you.",
				];
				const randomIndex = Math.floor(Math.random() * messages.length);
				console.warn("%c" + messages[randomIndex], "font-size: 1em; font-weight: bold");
			}, 1500);
		}, 100);
	};
	goTo = function (jumpToIndex) {
		console.log(jumpToIndex + 1 <= this.total);
		if (jumpToIndex + 1 <= this.total) {
			this.pause();
			this.goToSlide(jumpToIndex);
		} else {
			console.warn("Attempting to go to a slide that does not exist.", "Slide requested: " + jumpToIndex + " of " + this.total);
		}
	};
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
		// console.log("%cStarted Playing", "font-style: italic; font-size: 0.9em; color: #6F9F67; padding: 0.2em;");
		if (_this.settings.paused) {
			_this.settings.paused = false;
		}

		var nextSlideIndex = (_this.index + 1 + _this.total) % _this.total;

		if (_this.settings.progressive) {
			_this.progressiveLoadTimer = setTimeout(() => {
				_this.progressiveLoad((nextSlideIndex + 1 + _this.total) % _this.total);
			}, _this.settings.delay);
		}

		_this.goToSlide(nextSlideIndex);

		this.slideInterval = setInterval(function () {
			_this.next(_this, false);
		}, _this.settings.delay + _this.settings.transition);
	};
	pause = function (_this = this) {
		if (!_this.settings.paused) {
			_this.settings.paused = true;
			this.clearAllTimers();
		}
	};
}
