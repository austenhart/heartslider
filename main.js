// main.js
// const allSlideshows = document.querySelectorAll(".heart-slideshow");
// for (const slideshow of allSlideshows) {
const homepageSlider = new HeartSlider({
	allowFullVideoPlayback: false,
	buttons: true,
	clickToAdvance: false,
	keyboard: true,
	label: "Slideshow",
	debug: false,
	delayStart: 1000,
	slideshow: ".heart-slideshow",
	slides: ".heart-slide",
	transition: 3000,
	manualTransition: 800,
	delay: 1000,
	loop: true,
	randomize: false, // or "start" / "all"
	paused: false,
	effect: "fadeOut",
	pauseOnInactiveWindow: false,
	progressive: 1,
	swipe: true,
	stackOnMobile: {
		enable: false,
		threshold: 768,
	},
	counter: {
		enable: true,
		separator: " / ",
	},
	progressIndicators: {
		enable: true,
		type: "dot", // or "dot"
		clickable: true,
		color: "#fff",
	},
});

// homepageSlider.loadAllContent().then((results) => {
// 	console.log("All slide content attempted:", results);
// });

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
