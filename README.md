# Heartslider

### A Minimalist JavaScript Slideshow

##### Version 3.3.2

'''''''''''''''''

[![](https://data.jsdelivr.com/v1/package/gh/austenhart/heartslider/badge)](https://www.jsdelivr.com/package/gh/austenhart/heartslider)

Features:

-   No dependancies
-   Custom user settings
-   Small and lightweight
-   Progressive loading for multiple sourceset images
-   Optional swipe and click to advance

Change Log:

-   3.3.1 - Fixed issue with custom Events
-   3.3.0 - Added transitionStart and transitionEnd events
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

-   [ ] Add fadeRight or fadeLeft effect
-   [ ] Fix onTransitionEnd function timing
-   [ ] Expose a goTo function, add index and skip animation option
-   [ ] Delay start
-   [ ] Add ability to navigate with arrow keys
-   [ ] Make randomize a string with 'start' and 'all' options
-   [ ] Destroy function (including all event listeners and timers)
-   [ ] Restore transition animation options (crossfade vs fadeout)
-   [ ] Add counter (with custom separator, place inside heart-slideshow?)
-   [ ] Potentially add inner-container to house buttons and counter
-   [ ] Add progress indicator options (dots or dashes, with fill)
-   [ ] Support for <video>
-   [ ] Add support for the <picture> and elements with multiple sources
-   [ ] Fix stutter issue when changing tabs
-   [ ] Live swipe transition progress
-   [ ] Use JS bind() function instead of using "\_this" variable
-   [x] Remove delay when setting slideshows to paused
-   [x] Better way to manage multiple slideshows
-   [x] Add callback functions
-   [x] Make sure slideshow initializes when not using data-src or data-srcset
-   [x] Fix - clicking too soon after start skips slide transition for the first two slides
-   [x] Add first image loaded callback
-   [x] Add native support for prev/next buttons
-   [x] Fix pause not working
-   [x] Fix jump to second slide on click when slideshow is paused
-   [x] Swipe to advance
-   [x] Manually advancing a slide should transition quicker (or a custom time)
-   [x] Wait until first image load to start timer

'''''''''''''''

#### Last Updated: April, 6 2023
