// main.js
var homepageSlider = new HeartSlider({
	slideshow: ".heart-slideshow",
	slides: ".heart-slide",
	transition: 3000,
	delay: 1000,
	loop: true,
	randomize: false,
	paused: false,
	effect: "fadeOut",
	buttons: false,
	swipe: true,
	clickToAdvance: true,
	pauseOnInactiveWindow: true,
});

// Events
homepageSlider.on("transitionStart", function (slideshow, slideshowElement) {
	console.log("transitionStart");
	console.log(slideshow, slideshowElement);
});
homepageSlider.on("transitionEnd", function (slideshow, slideshowElement) {
	// console.log("transitionEnd");
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
