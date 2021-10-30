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

// const slideshow = document.querySelector(".heart-slideshow");
// const slideshows = document.querySelectorAll(".heart-slideshow");

// slideshows.forEach((slideshow) => {
// 	new HeartSlider({
// 		slideshow: slideshow,
// 	});
// });
