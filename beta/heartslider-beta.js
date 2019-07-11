// Trying a new approach
/* 
❤  Heartslider  ❤
❤ Version 3.0.0 ❤ ?
*/
class HeartSlider {
	constructor(userSettings) {
		var _this = this;
		// HeartSlider default settings
		_this.settings = {
			delay: 1000,
			effect: "fadeOut",
			loop: true,
			paused: false,
			progressive: true,
			randomize: false,
			slideshow: ".heart-slideshow",
			slides: ".heart-slide",
			transition: 3000
		};
		// Overwrite defaults with user-defined settings
		for (let prop in userSettings) {
			if (this.settings.hasOwnProperty(prop)) {
				this.settings[prop] = userSettings[prop];
			}
		}
		// Check to see if slideshow actually exists
		this.slideshowSelector = document.querySelector(
			_this.settings.slideshow
		);
		// Dont. Want. None. Unless. You. Got. Buns. Hun.
		if (!this.slideshowSelector) return false;

		// Setting up scoped variables
		this.slides = this.slideshowSelector.querySelectorAll(
			this.settings.slides
		);
		this.slides.forEach(slide => {
			slide.setAttribute("aria-hidden", "true");
			slide.setAttribute("tab-index", "-1");
		});
		this.total = this.slides.length;
		this.index = 0;
		this.transitioning = false;

		// Start
		if (this.settings.randomize) {
			this.index = Math.floor(Math.random() * this.total);
			this.progressiveLoad(this.index);
		}
		if (this.settings.progressive) this.progressiveLoad(this.index);
		this.goToSlide(this.index);

		if (!this.settings.paused) {
			let currentIndex = this.index;
			let startProgressiveLoad = function () {
				setTimeout(function () {
					_this.progressiveLoad((currentIndex + 1 + _this.total) % _this.total);
				}, _this.settings.delay);
			}
			window.requestAnimationFrame(startProgressiveLoad);
			let startAutoPlay = function () {
				_this.slideInterval = setInterval(function () {
					_this.next(_this);
				}, _this.settings.delay + _this.settings.transition);
			}
			window.requestAnimationFrame(startAutoPlay);
		}
		// // Disables the slideshow when the window in not in view
		// var heartVisibilityHandler = function () {
		// 	if (_this !== null && !_this.settings.paused) {
		// 		if (document.visibilityState == "hidden") {
		// 			console.log(
		// 				"%cWindow Lost Focus. HeartSlider is Paused.",
		// 				"font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;"
		// 			);
		// 			_this.pause();
		// 		} else {
		// 			console.log(
		// 				"%cRegained Focus. Resumed HeartSlider.",
		// 				"font-style: italic; font-size: 0.9em; color: #6F9F67; padding: 0.2em;"
		// 			);
		// 			_this.resume();
		// 			// This hides a white flash when going back to the slideshow
		// 			// currentSlide.style.transitionDuration = 0;
		// 			// currentSlide.style.opacity = 0.6;
		// 			// setTimeout(function() {
		// 			// 	currentSlide.style.transitionDuration = null;
		// 			// 	currentSlide.style.opacity = null;
		// 			// }, 100);
		// 		}
		// 	}
		// }
		let initVis = function () {
			return _this.heartVisibilityHandler(_this);
		}
		document.addEventListener("visibilitychange", initVis, true);

	}
	heartVisibilityHandler(_this) {
		// Disables the slideshow when the window in not in view
		if (_this !== null && !_this.settings.paused && document.querySelector(_this.settings.slideshow) !== null) {
			if (document.visibilityState == "hidden") {
				console.log(
					"%cWindow Lost Focus. HeartSlider is Paused.",
					"font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;"
				);
				_this.pause();
			} else {
				console.log(
					"%cRegained Focus. Resumed HeartSlider.",
					"font-style: italic; font-size: 0.9em; color: #6F9F67; padding: 0.2em;"
				);
				_this.resume();
				// This hides a white flash when going back to the slideshow
				// currentSlide.style.transitionDuration = 0;
				// currentSlide.style.opacity = 0.6;
				// setTimeout(function() {
				// 	currentSlide.style.transitionDuration = null;
				// 	currentSlide.style.opacity = null;
				// }, 100);
			}
		}
	}
	goToSlide(targetIndex) {
		// Check if slides are animating, if so, don't run this again.
		if (this.transitioning) return;
		// Set transitioning to true
		this.transitioning = true;

		// 1) Remove the old active class
		// 2) Find the new active slide
		// 3) Add the new active class
		let _this = this;
		function changeSlides() {
			let oldslide = _this.slides[_this.index];
			_this.index = (targetIndex + _this.total) % _this.total;
			let newslide = _this.slides[_this.index];
			// remove styles from old slide
			if (oldslide !== newslide) {
				oldslide.classList.remove("active");
				oldslide.setAttribute("aria-hidden", "true");
				oldslide.setAttribute("tab-index", "-1");
				oldslide.style.transitionDelay = _this.settings.transition + "ms";
				// oldslide.style.transitionDelay = 0 + 'ms';
				oldslide.style.transitionDuration = 0 + 'ms';
				// setTimeout(function () {
				// }, _this.settings.transition);
			}
			// add styles to new slide
			newslide.style.transitionDuration = _this.settings.transition + "ms";
			newslide.style.transitionDelay = 0 + 'ms';
			newslide.classList.add("active");
			newslide.removeAttribute("aria-hidden");
			newslide.removeAttribute("tab-index");
		};
		window.requestAnimationFrame(changeSlides);
	}
	progressiveLoad(target) {
		let currentImage = this.slides[target].querySelector('img');
		if (currentImage == undefined || currentImage.classList.contains("image-loaded")) return;
		const atts = ["sizes", "srcset", "src"];
		atts.forEach(function (attribute) {
			const targetAtt = currentImage.getAttribute("data-" + attribute);
			if (targetAtt && currentImage.getAttribute(attribute) == null) {
				currentImage.setAttribute(attribute, targetAtt);
				currentImage.setAttribute("data-" + attribute, '');
			}
		});
	}
	next(_this) {
		_this.transitioning = false;
		let nextIndex = this.index + 1 || 1;
		_this.goToSlide(nextIndex);

		if (_this.settings.progressive) {
			setTimeout(function () {
				_this.progressiveLoad(
					(nextIndex + 1 + _this.total) % _this.total
				);
			}, _this.settings.delay);
		}
	}
	previous() {
		const _this = this;
		let previousIndex = (_this.index - 1 + _this.total) % _this.total;
		_this.goToSlide(_this.index - 1);
		if (_this.settings.progressive) {
			_this.progressiveLoad(previousIndex);
		}
	}
	resume() {
		const _this = this;
		_this.goToSlide(_this.index + 1);
		this.slideInterval = setInterval(function () {
			_this.next(_this);
		}, _this.settings.delay + _this.settings.transition);
	}
	pause() {
		clearInterval(this.slideInterval);
	}
}