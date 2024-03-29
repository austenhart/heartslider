// main.js
// const allSlideshows = document.querySelectorAll(".heart-slideshow");
// for (const slideshow of allSlideshows) {
const homepageSlider = new HeartSlider({
	// slideshow: slideshow,
	slides: ".heart-slide",
	transition: 1000,
	manualTransition: 700,
	delay: 3000,
	loop: true,
	randomize: true, // give option for "start" and "all"
	paused: false,
	effect: "fadeOut", // "fadeOut" or "fadeInOut"
	buttons: false,
	swipe: true,
	clickToAdvance: true,
	pauseOnInactiveWindow: false,
	// NEW
	progressIndicators: {
		// type: "dot", // "dash" is default
		clickable: true,
		color: "#fff",
	},
});

// Events
// homepageSlider.on("transitionStart", function (slideshow, slideshowElement, currentSlide) {
// 	/* Code that runs on the START of each new slide goes here */
// 	console.log({ slideshow }, { slideshowElement }, { currentSlide });
// });
// homepageSlider.on("transitionEnd", function (slideshow, slideshowElement, currentSlide) {
/* Code that runs at the END of each transition goes here */
// console.log("NOW!");
// });
homepageSlider.on("firstImageLoad", function (slideshow, slideshowElement, currentSlide) {
	document.body.classList.add("remove-intro");
});
// }

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
