// main.js
// var homepageSlider = new HeartSlider({
// 	slideshow: ".original-slideshow",
// 	slides: ".heart-slide",
// 	transition: 3000,
// 	delay: 1000,
// 	loop: true,
// 	randomize: false,
// 	paused: false,
// 	progressive: true,
// 	effect: "fadeOut",
// 	swipe: false,
// });

var anotherSlider = new HeartSlider({
	swipe: true,
	pauseOnInactiveWindow: true,
	clickToAdvance: true,
	// loop: false,
	// randomize: true,
	// slideshow: ".stealthy-slideshow",
	// transition: 1000,
	// delay: 200,
	// paused: true,
	// progressive: false, // just, like, never disable this.
});

// const slideshow = document.querySelector(".heart-slideshow");
// const slideshows = document.querySelectorAll(".heart-slideshow");

// slideshows.forEach((slideshow) => {
// 	new HeartSlider({
// 		slideshow: slideshow,
// 	});
// 	// VS
// 	// slideshow.heartSlider({
// 	// 	paused: true,
// 	// });
// });

// console.log(homepageSlider.goToSlide());
