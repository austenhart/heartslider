// main.js
var homepageSlider = new HeartSlider({
	slideshow: ".heart-slideshow",
	slides: ".heart-slide",
	transition: 3000,
	delay: 1000,
	loop: true,
	randomize: false,
	paused: false,
	progressive: true, // just, like, never disable this.
	effect: "fadeOut",
	swipe: true,
	pauseOnInactiveWindow: true,
	clickToAdvance: true,
});

// const slideshow = document.querySelector(".heart-slideshow");
// const slideshows = document.querySelectorAll(".heart-slideshow");

// slideshows.forEach((slideshow) => {
// 	new HeartSlider({
// 		slideshow: slideshow,
// 	});
// });
