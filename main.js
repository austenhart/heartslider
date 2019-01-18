var documentReady = function () {
    // If you don't need to change defaults, simply use: 
    // heartSlider.init();

    // otherwise, here's all the default values:
    heartSlider.init({
        slideshow: '.myCustomClass',
        slides: '.heart-slide',
        transition: 4000,
        delay: 2000,
        loop: true,
        randomize: false,
        paused: true,
        progressive: true
    });
    setTimeout(() => {
        heartSlider.resume();
    }, 2000);
};





// Ignore.
// Document Ready Listener
if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {documentReady();} else {document.addEventListener('DOMContentLoaded', documentReady);};