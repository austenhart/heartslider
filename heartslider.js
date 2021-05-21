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
			progressive: true,
			randomize: false,
			slideshow: ".heart-slideshow",
			slides: ".heart-slide",
			transition: 3000,
			pauseOnInactiveWindow: false,
		};

		/* Overwrite defaults with user-defined settings */
		for (var prop in userSettings) {
			if (this.settings.hasOwnProperty(prop)) {
				this.settings[prop] = userSettings[prop];
			}
		}

		/* Check to see if slideshow actually exists */
		this.slideshowSelector = typeof _this.settings.slideshow === "object" ? _this.settings.slideshow : document.querySelector(_this.settings.slideshow);

		/* Dont. Want. None. Unless. You. Got. Buns. Hun. */
		if (!this.slideshowSelector) return false;

		/* Setting up scoped variables */
		this.slides = Array.prototype.slice.apply(this.slideshowSelector.querySelectorAll(this.settings.slides));
		this.slides.forEach(function (slide) {
			slide.setAttribute("aria-hidden", "true");
			slide.setAttribute("tab-index", "-1");
		});
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

		document.addEventListener("visibilitychange", initVis, true);
	}

	heartVisibilityHandler(_this) {
		/* Disables the slideshow when the window in not in view */
		if (_this !== null && !_this.settings.paused && _this.settings.pauseOnInactiveWindow && document.querySelector(_this.settings.slideshow) !== null) {
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
