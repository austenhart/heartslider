# Heartslider

### A Minimalist JavaScript Slideshow

##### Version 3.2.7

[![](https://data.jsdelivr.com/v1/package/gh/austenhart/heartslider/badge)](https://www.jsdelivr.com/package/gh/austenhart/heartslider)

'''''''''''''''''

Features:

-   No dependancies
-   Custom user settings
-   Small and lightweight
-   Progressive loading for multiple sourceset images
-   Optional swipe and click to advance

Change Log:

-   3.2.7 - Many QOL improvements; buttons will auto-pause slideshow while click/swipe will not
-   3.2.6 - Fixed prev/next button selector
-   3.2.5 - Loop false works again
-   3.2.5 - Loop false works again
-   3.2.4 - Fixed issue with tab-index on first slide
-   3.2.3 - Added support for buttons!
-   3.2.2 - Fixed issue with progressiveLoad.
-   3.2.1 - Fixing timing errors with pause/resume/click/swipe
-   3.2.0 - Added click and swipe to advance
-   3.1.5 - Cleaning up repo and getting ready for 4.0
-   3.1.4 - Support for multiple images within slides
-   3.1.3 - First slide no longer takes years to fade in on start
-   3.1.2 - Comment improvements, removed will-change from CSS
-   3.1.1 - Fixed setting paused issues, added option to enable pauseOnInactiveWindow
-   2.1.3 - Added option to enable or disable the visibility change function
-   2.1.2 - Slideshow now pauses when user changes tabs/windows. PREV function still not working. Converted spaces to tabs.
-   2.1.1 - Fixed flashing z-index problem with custom transition
-   2.1.0 - Cleaned up code and added ability to choose between fadeOut (default) and fadeInOut!
-   2.0.6 - Fixed private variable scope error
-   2.0.5 - Added conditionals for slides without images
-   2.0.4 - Fixed jumping issue when looping past last slide
-   2.0.3 - Updated CSS and JS for compatibility with IE (ugh)
-   2.0.2 - Removed .children selector so jQuery doesn't get confused

To Do:

-   [ ] Add callback functions
-   [ ] Support for video
-   [ ] Use JS bind() function instead of using "\_this" variable
-   [ ] Better way to manage multiple slideshows
-   [x] Make sure slideshow initializes when not using data-src or data-srcset
-   [x] Fix - clicking too soon after start skips slide transition for the first two slides
-   [x] Add first image loaded callback
-   [x] Add native support for prev/next buttons
-   [x] Fix pause not working
-   [x] Fix jump to second slide on click when slideshow is paused
-   [x] Swipe to advance
-   [x] Manually advancing a slide should transition quicker (or a custom time)
-   [x] Wait until first image load to start timer
-   [ ] Remove Class format?

'''''''''''''''

#### Last Updated: October 30, 2021
