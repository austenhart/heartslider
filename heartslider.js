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
		});

		/* Setting up scoped variables */
		this.total = this.slides.length;
		this.index = 0;
		this.transitioning = false;

		/* Start */
		if (this.settings.randomize) {
			this.index = Math.floor(Math.random() * this.total);
			this.progressiveLoad(this.index);
		}

		if (this.settings.progressive) this.progressiveLoad(this.index);
		this.goToSlide(this.index, true);

		if (!this.settings.paused) {
			var currentIndex = this.index;

			var startProgressiveLoad = function startProgressiveLoad() {
				setTimeout(function () {
					_this.progressiveLoad((currentIndex + 1 + _this.total) % _this.total);
				}, _this.settings.delay);
			};

			window.requestAnimationFrame(startProgressiveLoad);

			var startAutoPlay = function startAutoPlay() {
				_this.slideInterval = setInterval(function () {
					_this.next(_this);
				}, _this.settings.delay + _this.settings.transition);
			};

			window.requestAnimationFrame(startAutoPlay);
		}

		var initVis = function initVis() {
			return _this.heartVisibilityHandler(_this);
		};
		if (_this.settings.pauseOnInactiveWindow) {
			document.addEventListener("visibilitychange", initVis, true);
		}

		if (_this.settings.swipe) {
			// another test comment
			_this.slideshowSelector.addEventListener("touchstart", _this.swipeHandler.handleTouchStart, false);
			_this.slideshowSelector.addEventListener("touchmove", _this.swipeHandler.handleTouchMove, false);
		}
	}

	swipeHandler(_this) {
		var xDown = null;
		var yDown = null;

		function getTouches(evt) {
			return (
				evt.touches || // browser API
				evt.originalEvent.touches
			); // jQuery
		}

		function handleTouchStart(evt) {
			const firstTouch = getTouches(evt)[0];
			xDown = firstTouch.clientX;
			yDown = firstTouch.clientY;
		}

		function handleTouchMove(evt) {
			if (!xDown || !yDown) {
				return;
			}

			var xUp = evt.touches[0].clientX;
			var yUp = evt.touches[0].clientY;

			var xDiff = xDown - xUp;
			var yDiff = yDown - yUp;

			if (Math.abs(xDiff) > Math.abs(yDiff)) {
				/*most significant*/
				if (xDiff > 0) {
					/* left swipe */
				} else {
					/* right swipe */
				}
			} else {
				if (yDiff > 0) {
					/* up swipe */
				} else {
					/* down swipe */
				}
			}
			/* reset values */
			xDown = null;
			yDown = null;
		}
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
	goToSlide(targetIndex, isFirstSlide) {
		/* Check if slides are animating, if so, don't run this again. */
		if (this.transitioning) return;
		/* Set transitioning to true */
		this.transitioning = true;

		/* 
		1) Remove the old active class
		2) Find the new active slide
		3) Add the new active class 
		*/
		var _this = this;

		function changeSlides() {
			var oldslide = _this.slides[_this.index];
			_this.index = (targetIndex + _this.total) % _this.total;
			var newslide = _this.slides[_this.index];

			/* remove styles from old slide */
			if (oldslide !== newslide) {
				oldslide.classList.remove("active");
				oldslide.setAttribute("aria-hidden", "true");
				oldslide.setAttribute("tab-index", "-1");
				oldslide.style.transitionDelay = _this.settings.transition + "ms";

				// oldslide.style.transitionDelay = 0 + 'ms';
				oldslide.style.transitionDuration = 0 + "ms";
				// setTimeout(function () {
				// }, _this.settings.transition);
			}

			/* add styles to new slide */
			var duration = _this.settings.transition;
			if (isFirstSlide) duration = 400;
			newslide.style.transitionDuration = duration + "ms";
			newslide.style.transitionDelay = 0 + "ms";
			newslide.classList.add("active");
			newslide.removeAttribute("aria-hidden");
			newslide.removeAttribute("tab-index");
		}

		window.requestAnimationFrame(changeSlides);
	}
	progressiveLoad(target) {
		var currentImages = Array.prototype.slice.call(this.slides[target].querySelectorAll("img"));
		currentImages.forEach(function (currentImage) {
			if (currentImage == undefined || currentImage.classList.contains("image-loaded")) return;
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
	next(_this) {
		_this.transitioning = false;
		var nextIndex = this.index + 1 || 1;

		_this.goToSlide(nextIndex);

		if (_this.settings.progressive) {
			setTimeout(function () {
				_this.progressiveLoad((nextIndex + 1 + _this.total) % _this.total);
			}, _this.settings.delay);
		}
	}
	previous() {
		var _this = this;

		var previousIndex = (_this.index - 1 + _this.total) % _this.total;

		_this.goToSlide(_this.index - 1);

		if (_this.settings.progressive) {
			_this.progressiveLoad(previousIndex);
		}
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
