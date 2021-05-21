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
// });

// var anotherSlider = new HeartSlider({
// 	slideshow: ".test-slideshow",
// 	delay: 200,
// });

const slideshows = document.querySelectorAll(".heart-slideshow");
slideshows.forEach((slideshow) => {
	new HeartSlider({
		slideshow: slideshow,
		// paused: true,
	});
	// VS
	// slideshow.heartSlider({
	// 	paused: true,
	// });
});

// console.log(homepageSlider.goToSlide());
