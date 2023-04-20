// main.js
var homepageSlider = new HeartSlider({
	slideshow: ".heart-slideshow",
	slides: ".heart-slide",
	transition: 3000,
	manualTransition: 200,
	delay: 1000,
	loop: true,
	randomize: false, // give option for "start" and "all"
	paused: false,
	effect: "fadeOut",
	buttons: false,
	swipe: true,
	clickToAdvance: false,
	pauseOnInactiveWindow: true,
	// NEW
	progressIndicators: {
		type: "dash", // or "dot"
		showProgress: false,
		clickable: true,
		color: "#fff",
		test: false,
	},
});

// Events
/* Optional */
homepageSlider.on("transitionStart", function (slideshow, slideshowElement, currentSlide) {
	// console.log("transitionStart");
	// console.log({ slideshow }, { slideshowElement }, { currentSlide });
	// console.log(slideshow.index);
});
homepageSlider.on("transitionEnd", function (slideshow, slideshowElement, currentSlide) {
	// console.log("transitionEnd");
	// console.log({ slideshow }, { slideshowElement }, { currentSlide });
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
