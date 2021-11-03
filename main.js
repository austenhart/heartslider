// main.js
var homepageSlider = new HeartSlider({
	slideshow: ".heart-slideshow",
	slides: ".heart-slide",
	transition: 3000,
	manualTransition: 200,
	delay: 1000,
	loop: true,
	randomize: false,
	paused: false,
	effect: "fadeOut",
	buttons: true,
	swipe: true,
	clickToAdvance: true,
	pauseOnInactiveWindow: true,
});

// Events
/* Optional */
homepageSlider.on("transitionStart", function (slideshow, slideshowElement, currentSlide) {
	console.log("transitionStart");
	// console.log({ slideshow }, { slideshowElement }, { currentSlide });
});
homepageSlider.on("transitionEnd", function (slideshow, slideshowElement, currentSlide) {
	console.log("transitionEnd");
});

// Multiple Slideshows
// homepageSlider.on("transitionEnd", function (slide) {
// 	var slideIndex = slide.index();
// 	console.log("slide changed", slideIndex);
// });

// const slideshow = document.querySelector(".heart-slideshow");
// const slideshows = document.querySelectorAll(".heart-slideshow");

// slideshows.forEach((slideshow) => {
// 	new HeartSlider({
// 		slideshow: slideshow,
// 	});
// });
