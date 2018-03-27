var documentReady = function () {
    heartslider(document.getElementById("slideshow"));
}

// Document Ready Listener
if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
    documentReady();
} else {
    document.addEventListener('DOMContentLoaded', documentReady);
}

function heartslider(slideshow) {
    "use strict";

    let speed = 3000,
        loop = true,
        duration = 2000 + (speed * 0.5),
        slides = slideshow.children,
        count = slides.length,
        index = 0,
        hearttime;

    slides[index].classList.add('active');

    // let's ride.
    let start = function () {
        let previous = index - 1;
        if (previous < 0) previous = count - 1;

        let previousSlide = slides[previous],
            currentSlide = slides[index];
        currentSlide.classList.add('active');
        previousSlide.classList.add('previous');
        setTimeout(function() {
            previousSlide.classList.remove('active', 'previous');
        }, duration);
        index++;
        if (index == 2) duration = duration + (speed * 0.5);
        if (loop) {
            if (index == count) index = 0;
            hearttime = window.setTimeout(start, duration);
        } else {
            if (index < count) setTimeout(start, duration);
        }
    };
    start();
    slides[count - 1].classList.remove('previous');
};
