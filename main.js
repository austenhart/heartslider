var documentReady = function () {
    // If you don't need to change defaults, simply use: 
    // heartSlider.init();

    // otherwise, here's all the default values:
    heartSlider.init({
        // slideshow: '.customClassName',
        // slides: '.customSlideName',
        transition: 3000,
        delay: 1000,
        loop: true,
        randomize: false,
        paused: false,
        progressive: true,
        effect: 'fadeOut'
        // effect: 'fadeInOut'
    });

    /* 
    Available Public Functions:

    heartSlider.init();
    // Inits heartSlider with default settings
    
    heartSlider.settings();
    // Returns all current/custom settings
    
    heartSlider.current();
    // Returns current slide index

    heartSlider.slideshow();
    // Returns slideshow selector

    heartSlider.slides();
    // Returns slides as NodeList

    heartSlider.count();
    // Returns total number of slides
    
    heartSlider.pause();
    // Stops the slideshow from progressing to the next slide
    
    heartSlider.resume();
    // Starts the slideshow back up
    
    heartSlider.next();
    // Manually advance to next slide
    */
};

// Ignore.
// Document Ready Listener
if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {documentReady();} else {document.addEventListener('DOMContentLoaded', documentReady);};