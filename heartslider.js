/*
❤  Heartslider  ❤
❤ Version 2.0.5 ❤
'''''''''''''''''

Features:
❤ No dependancies
❤ Custom user settings
❤ Small, lightweight and supports IE10
❤ Progressive loading for sourceset and regular src images

Change Log:
❤ 2.0.5 Added conditionals for slides without images
--
❤ 2.0.4 Fixed jumping issue when looping past last slide
--
❤ 2.0.3 Updated CSS and JS for compatibility with IE (ugh)
--
❤ Removed .children selector so jQuery doesn't get confused

To Do:
❤ Add option to use Fade In/Out rather than (Default) Crossfade effect
❤ Additional easing options
'''''''''''''''

Last Updated: January 18, 2019
*/
var heartSlider = (function () {
    // test comment
    "use strict";
    // HeartSlider default settings
    var settings = {
        slideshow: '.heart-slideshow',
        slides: '.heart-slide',
        transition: 3000,
        delay: 2000,
        loop: true,
        randomize: false,
        paused: false,
        progressive: true
    };
    // Private variables and functions
    var index = 0,
        prop,
        isStart = true,
        slideshowSelector = document.querySelector(settings.slideshow);

    if (!slideshowSelector) return;

    var slides = slideshowSelector.querySelectorAll(settings.slides),
        count = slides.length,
        previousSlide,
        currentSlide;

    // Initial setup based on settings
    var start = function () {
        if (settings.randomize) index = Math.floor(Math.random() * count);
        if (settings.progressive) progressiveLoad(slides[index].querySelector('img'));
        // if (settings.paused) isStart = false; // this was causing flickering issues on repeat
        nextSlide();
        isStart = false;
    };

    // Loads the next image in the sequence
    // Only triggers an event if image is missing a src, srcset, or sizes attribute
    var progressiveLoad = function (currentImage) {
        if (currentImage == undefined) return;
        var dataSrc = currentImage.getAttribute('data-src'),
            dataSizes = currentImage.getAttribute('data-sizes'),
            dataSrcset = currentImage.getAttribute('data-srcset');

        if (dataSizes && currentImage.getAttribute('sizes') == null) currentImage.setAttribute('sizes', dataSizes);
        if (dataSrcset && currentImage.getAttribute('srcset') == null) currentImage.setAttribute('srcset', dataSrcset);
        if (dataSrc && currentImage.getAttribute('src') == null) currentImage.setAttribute('src', dataSrc);
    };

    // Onto the main event
    var nextSlide = function () {
        var previous = index - 1;
        if (previous < 0) previous = count - 1;

        previousSlide = slides[previous];
        currentSlide = slides[index];

        currentSlide.classList.add('active');
        if (!isStart) previousSlide.classList.add('previous');
        if (settings.transition !== 3000) {
            currentSlide.style.WebkitTransitionDuration = settings.transition + 'ms';
            currentSlide.style.MozTransitionDuration = settings.transition + 'ms';
            currentSlide.style.transitionDuration = settings.transition + 'ms';
        };
        if (settings.progressive) {
            var next = index + 1;
            if (index == count - 1) next = 0;
            var currentImage = slides[next].querySelector('img');
            progressiveLoad(currentImage);
        };

        index++;

        if (settings.paused) return;
        if (!settings.paused || !isStart) {
            setTimeout(function () {
                previousSlide.classList.remove('active', 'previous');
                if (settings.transition !== 3000) {
                    currentSlide.style.WebkitTransitionDuration = '0ms';
                    currentSlide.style.MozTransitionDuration = '0ms';
                    currentSlide.style.transitionDuration = '0ms';
                };
            }, settings.delay + settings.transition);

            if (settings.loop) {
                if (index == count) index = 0;
                setTimeout(function () {
                    heartSlider.nextSlide(index);
                }, settings.delay + settings.transition);
            } else {
                if (index < count) setTimeout(nextSlide(index), settings.delay);
            };
        };

    };
    var pauseSlide = function () {
        settings.paused = true;
    };
    var resumeSlide = function () {
        settings.paused = false;
        isStart = false;
        heartSlider.nextSlide(heartSlider.getIndex());
    };

    // Public functions
    // Accessible via heartSlider.functionName(properties);
    // Ex: heartSlider.init({transition: 4000, slideshow: '.homepage-slideshow'});
    return {
        init: function (userSettings) {
            // imports user settings and overrides defaults
            for (prop in userSettings) {
                if (settings.hasOwnProperty(prop)) {
                    settings[prop] = userSettings[prop];
                };
            };
            // if you have slides, then kick off to nextSlide.
            if (count > 1) start(index);
        },
        settings: function () {
            return settings;
        },
        getIndex: function () {
            return index;
        },
        pause: function () {
            pauseSlide();
        },
        resume: function () {
            resumeSlide();
        },
        nextSlide: function () {
            nextSlide();
        }
    };

})();
