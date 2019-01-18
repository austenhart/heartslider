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
        paused: false,
        progressive: true
    });

    /* 
    Available Public Functions:

    heartSlider.init();
    // Inits heartSlider with default settings
    
    heartSlider.settings();
    // Returns all current/custom settings
    
    heartSlider.getIndex();
    // Returns index of current slide
    
    heartSlider.pause();
    // Stops the slideshow from progressing to the next slide
    
    heartSlider.resume();
    // Starts the slideshow back up
    
    heartSlider.nextSlide();
    // Manually advance to next slide
    */
};

// Ignore.
// Document Ready Listener
if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {documentReady();} else {document.addEventListener('DOMContentLoaded', documentReady);};