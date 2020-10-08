/*
❤  Heartslider  ❤
❤ Version 2.1.3 ❤
'''''''''''''''''

Features:
❤ No dependancies
❤ Custom user settings
❤ Small, lightweight and supports IE10
❤ Progressive loading for sourceset and regular src images

Change Log:
❤ 2.1.3 Added option to enable or disable the visibility change function
--
❤ 2.1.2 Slideshow now pauses when user changes tabs/windows. PREV function still not working. Converted spaces to tabs.
--
❤ 2.1.1 Fixed flashing z-index problem with custom transition
--
❤ 2.1.0 Cleaned up code and added ability to choose between fadeOut (default) and fadeInOut!
--
❤ 2.0.6 Fixed private variable scope error
--
❤ 2.0.5 Added conditionals for slides without images
--
❤ 2.0.4 Fixed jumping issue when looping past last slide
--
❤ 2.0.3 Updated CSS and JS for compatibility with IE (ugh)
--
❤ Removed .children selector so jQuery doesn't get confused

To Do:
❤ Fix Previous/next Commands
❤ Additional easing options
'''''''''''''''

Last Updated: January 23, 2019
*/
var heartSlider = (function () {
    "use strict";
    // HeartSlider default settings
    var settings = {
        slideshow: ".heart-slideshow",
        slides: ".heart-slide",
        transition: 3000,
        delay: 1000,
        loop: true,
        randomize: false,
        paused: false,
        progressive: true,
        effect: "fadeOut",
        enableVisibilityChange: false
    };
    // Private variables and functions
    var index,
        prop,
        isStart,
        slides,
        count,
        previousSlide,
        currentSlide,
        status,
        fadeInOut;

    // Initial setup based on settings
    var start = function () {
        if (settings.randomize) index = Math.floor(Math.random() * count);
        if (settings.progressive)
            progressiveLoad(slides[index].querySelector("img"));
        nextSlide();
        isStart = false;
    };

    // Loads the next image in the sequence
    // Only triggers an event if image is missing a src, srcset, or sizes attribute
    var progressiveLoad = function (currentImage) {
        if (currentImage == undefined) return;
        var dataSrc = currentImage.getAttribute("data-src"),
            dataSizes = currentImage.getAttribute("data-sizes"),
            dataSrcset = currentImage.getAttribute("data-srcset");

        if (dataSizes && currentImage.getAttribute("sizes") == null)
            currentImage.setAttribute("sizes", dataSizes);
        if (dataSrcset && currentImage.getAttribute("srcset") == null)
            currentImage.setAttribute("srcset", dataSrcset);
        if (dataSrc && currentImage.getAttribute("src") == null)
            currentImage.setAttribute("src", dataSrc);
    };

    // Onto the main event
    var nextSlide = function (current, manualMode, reverse) {
        // If slideshow is paused and you are not calling heartSlider.next(), don't do anything.
        if (settings.paused && !manualMode) return;
        // Dont allow nextSlide to be called if it is already doing it
        if (status === "running") return;
        // Used for goTo method.
        if (current !== undefined) index = current;

        // Setting up previous/next slides
        var previous;
        if (reverse !== undefined) {
            index--;
            if (index < 0) index = count - 1;
            previous = index + 1;
        } else {
            previous = index - 1;
            if (previous < 0) previous = count - 1;
        }

        previousSlide = slides[previous];
        currentSlide = slides[index];

        status = "running";

        currentSlide.classList.add("active");
        if (!isStart) {
            previousSlide.classList.add("previous");
        } else {
            currentSlide.style.transitionDuration = "0ms";
            setTimeout(function() {
                currentSlide.style.transitionDuration = null;
            }, 100);
        }
        if (
            !isStart &&
            settings.transition !== 3000 &&
            currentSlide.style.transitionDuration !== settings.transition + "ms"
        ) {
            currentSlide.style.transitionDuration = settings.transition + "ms";
        }
        if (settings.progressive) {
            var next = index + 1;
            if (index == count - 1) next = 0;
            var currentImage = slides[next].querySelector("img");
            progressiveLoad(currentImage);
        }

        // console.log("current Slide", previous);
        // console.log("previous Slide", index);
        reverse ? index-- : index++;
        // index++;

        if (!settings.paused || !isStart) {
            if (fadeInOut) previousSlide.classList.remove("active");
            let scopedPreviousSlide = previousSlide;
            if (document.querySelector(settings.slideshow) == null)
                return false;
            setTimeout(function () {
                scopedPreviousSlide.classList.remove("previous");
                if (!fadeInOut) scopedPreviousSlide.classList.remove("active");
                if (!fadeInOut && settings.transition !== 3000) {
                    scopedPreviousSlide.style.transitionDuration = "0ms";
                }
                status = "waiting";
            }, settings.transition);

            if (settings.loop) {
                if (!reverse && index == count) index = 0;
                setTimeout(function () {
                    nextSlide();
                }, settings.delay + settings.transition);
            } else {
                if (index < count) setTimeout(nextSlide(), settings.delay);
            }
        }
        // if(manualMode) manualMode = false;
    };
    var prevSlide = function () {
        nextSlide(heartSlider.current(), true, true);
    };
    var pauseSlide = function () {
        settings.paused = true;
    };
    var resumeSlide = function () {
        settings.paused = false;
        isStart = false;
        nextSlide(heartSlider.current(), false);
    };

    // Disables the slideshow when the window in not in view
    if (!settings.paused || !settings.loop) {
        if (settings.enableVisibilityChange) {
            document.addEventListener("visibilitychange", function () {
                if (document.visibilityState == "hidden") {
                    console.log(
                        "%cWindow Lost Focus. HeartSlider is Paused.",
                        "font-style: italic; font-size: 0.9em; color: #757575; padding: 0.2em;"
                    );
                    heartSlider.pause();
                } else {
                    console.log(
                        "%cRegained Focus. Resumed HeartSlider.",
                        "font-style: italic; font-size: 0.9em; color: #6F9F67; padding: 0.2em;"
                    );
                    heartSlider.resume();
                    // This hides a white flash when going back to the slideshow
                    currentSlide.style.transitionDuration = 0;
                    currentSlide.style.opacity = 0.6;
                    setTimeout(function () {
                        currentSlide.style.transitionDuration = null;
                        currentSlide.style.opacity = null;
                    }, 100);
                }
            });
        }
    }

    // Public functions
    // Accessible via heartSlider.functionName(properties);
    // Ex: heartSlider.init({transition: 4000, slideshow: '.homepage-slideshow'});
    return {
        init: function (userSettings) {
            // imports user settings and overrides defaults
            for (prop in userSettings) {
                if (settings.hasOwnProperty(prop)) {
                    settings[prop] = userSettings[prop];
                }
            }
            // Check to see if slideshow actually exists
            var slideshowSelector = document.querySelector(settings.slideshow);
            // Dont. Want. None. Unless. You. Got. Buns. Hun.
            if (!slideshowSelector) return false;

            // Define private variables
            (slides = slideshowSelector.querySelectorAll(settings.slides)),
            (count = slides.length),
            (index = 0),
            (isStart = true),
            (status = "waiting"),
            (fadeInOut = settings.effect == "fadeInOut");

            // if you have slides, then kick off to nextSlide.
            if (count > 1) start(index);
        },
        settings: function () {
            return settings;
        },
        current: function () {
            return index;
        },
        status: function () {
            return status;
        },
        slideshow: function () {
            return document.querySelector(settings.slideshow);
        },
        slides: function () {
            return slides;
        },
        count: function () {
            return count;
        },
        pause: function () {
            pauseSlide();
        },
        resume: function () {
            resumeSlide();
        },
        next: function () {
            nextSlide(heartSlider.current(), true);
        },
        prev: function () {
            prevSlide();
        },
        goTo: function (current) {
            if (current == undefined) current = heartSlider.current();
            nextSlide(current);
        }
    };
})();