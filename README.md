# Heartslider

### A Minimalist JavaScript Slideshow

##### Version 3.5.7

'''''''''''''''''

[![](https://data.jsdelivr.com/v1/package/gh/austenhart/heartslider/badge)](https://www.jsdelivr.com/package/gh/austenhart/heartslider)

Release Workflow:

- `npm run build` automatically syncs version strings in source files from package.json before building.
- `npm run release -- patch` bumps package.json, syncs version strings, builds, then prompts to publish to npm and push to GitHub.
- During release, you can optionally auto-create a release commit and matching `vX.Y.Z` git tag before publish/push prompts.
- You can also run `npm run release -- minor` or `npm run release -- major`.

Features:

- No dependancies
- Custom user settings
- Small and lightweight
- Progressive loading for multiple sourceset images and video
- Optional swipe and click to advance

Styling the progress indicators:

The indicators are spaced relative to the **slideshow**, not the viewport, so a slideshow
in a narrow column looks the same as a full-bleed one. Each indicator gets an equal slot
(`track width / number of slides`) and the gap is a fraction of that slot, so the spacing
stays proportional whether there are 3 slides or 30. Override any of these on
`.progress-container`:

| Property            | Default (dash / dot)                                                     | What it does                                                                                                          |
| ------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `--gap-ratio`       | `0.4` / `0`                                                              | Gap as a fraction of one indicator slot. `0` = slots touch, `1` = very airy. The easiest knob to reach for on dashes. |
| `--indicator-gap`   | derived from `--gap-ratio`                                               | Set this for an absolute gap instead (e.g. `8px`), bypassing the ratio.                                               |
| `--track-width`     | `calc(100% / (5 + var(--total)) * var(--total))`                         | Width of the indicator track as a percentage of the slideshow.                                                        |
| `--track-max-width` | `calc(4rem * var(--total))` / `calc(var(--dot-size) * 4 * var(--total))` | Track stops growing here. Use `none` to let it fill `--track-width`. On dots this is what sets their spacing.         |
| `--dot-size`        | `6px` (dot only)                                                         | Diameter of a dot. Dots shrink below this only if the slideshow is too narrow to fit them.                            |
| `--indicator-color` | `#fff`                                                                   | Indicator color (also settable via the `progressIndicators.color` option).                                            |

A dash fills its slot, so its spacing is the gap between slots (`--gap-ratio`). A dot does
not fill its slot, so its spacing comes from how wide the slot is (`--track-max-width`),
which leaves the whole slot clickable rather than shrinking the target down to the dot.

```css
/* Tighter dashes, spread across a wider track */
.progress-container.type-dash {
	--gap-ratio: 0.2;
	--track-width: 80%;
	--track-max-width: none;
}

/* Bigger dots, spaced 6x their own size apart */
.progress-container.type-dot {
	--dot-size: 10px;
	--track-max-width: calc(var(--dot-size) * 6 * var(--total));
}
```

`--total` is set on the container by JavaScript and is the number of slides; treat it as
read-only. The older `--gutter` property is still honoured if you were overriding it.

Change Log:

#### Last Updated: September 9, 2026

- 3.5.7 - Fixed progress indicator gap.
- 3.5.6 - Fixed progressive loading bug.
- 3.5.5 - Created new release process for versioning and publishing.
- 3.5.4 - Added stackOnMobile and preload APIs, improved transition/manual-skip timing, fixed allowFullVideoPLayback bug.
- 3.5.3 - Fixed destroy debug bug.
- 3.5.2 - Fixed goTo debug bug again.
- 3.5.1 - Fixed goTo debug bug, and allowFullVideoPlayback option.
- 3.5.0 - Improved logic for slide timing, delay, and manual transition. Progressive now supports an offset. Added debug setting.
- 3.4.14 - Fixed an animation stutter when manually advancing slides / looping on videos is now optional.
- 3.4.13 - Prevented videos from auto-playing paused slideshows.
- 3.4.12 - Fixed issue with duplicated active class.
- 3.4.11 - Added module file for NPM imports (mjs).
- 3.4.10 - Added CSS to package.json.
- 3.4.9 - Fixed package.json command.
- 3.4.8 - Fixed minified file issue.
- 3.4.7 - Added Destroy and GoTo functions. Restored FadeInOut option for transition effect.
- 3.4.6 - Fixed loadHandler error
- 3.4.5 - Fixed gap with dash, smoother visibilityHandler animations
- 3.4.4 - Made dots look less awful. Added 'firstImageLoad' callback.
- 3.4.3 - Added 'dots' for indicators and babel to workflow
- 3.4.2 - Reverted 'first-image-loaded' class
- 3.4.1 - Fixed issue with initing multiple slideshows
- 3.4.0 - Added progress indicators and support for video
- 3.3.1 - Fixed issue with custom Events
- 3.3.0 - Added transitionStart and transitionEnd events
- 3.2.7 - Many QOL improvements; buttons will auto-pause slideshow while click/swipe will not
- 3.2.6 - Fixed prev/next button selector
- 3.2.5 - Loop false works again
- 3.2.5 - Loop false works again
- 3.2.4 - Fixed issue with tab-index on first slide
- 3.2.3 - Added support for buttons!
- 3.2.2 - Fixed issue with progressiveLoad.
- 3.2.1 - Fixing timing errors with pause/resume/click/swipe
- 3.2.0 - Added click and swipe to advance
- 3.1.5 - Cleaning up repo and getting ready for 4.0
- 3.1.4 - Support for multiple images within slides
- 3.1.3 - First slide no longer takes years to fade in on start
- 3.1.2 - Comment improvements, removed will-change from CSS
- 3.1.1 - Fixed setting paused issues, added option to enable pauseOnInactiveWindow
- 2.1.3 - Added option to enable or disable the visibility change function
- 2.1.2 - Slideshow now pauses when user changes tabs/windows. PREV function still not working. Converted spaces to tabs.
- 2.1.1 - Fixed flashing z-index problem with custom transition
- 2.1.0 - Cleaned up code and added ability to choose between fadeOut (default) and fadeInOut!
- 2.0.6 - Fixed private variable scope error
- 2.0.5 - Added conditionals for slides without images
- 2.0.4 - Fixed jumping issue when looping past last slide
- 2.0.3 - Updated CSS and JS for compatibility with IE (ugh)
- 2.0.2 - Removed .children selector so jQuery doesn't get confused

To Do:

- [ ] If video is not long enough, slow it down at the end to prevent abrupt stop
- [ ] Add fadeRight or fadeLeft effect
- [x] Delay start
- [ ] Add ability to navigate with arrow keys
- [ ] Make randomize a string with 'start' and 'all' options
- [ ] Add counter (with custom separator, place inside heart-slideshow?)
- [ ] Add support for the <picture> and elements with multiple sources
- [ ] Live swipe transition progress
- [ ] Use JS bind() function instead of using "\_this" variable
- [x] Potentially add inner-container to house buttons and counter
- [x] Expose a goTo function, add index and skip animation option
- [x] Restore transition animation options (crossfade vs fadeout)
- [x] Destroy function (including all event listeners, timers, classnames and attributes)
- [x] Fix onTransitionEnd function timing
- [x] Fix stutter issue when changing tabs
- [x] Add type: "dot" option to indicators
- [x] Add firstImageLoaded callback
- [x] Add progress indicator options (dots or dashes, with fill)
- [x] Support for <video>
- [x] Remove delay when setting slideshows to paused
- [x] Better way to manage multiple slideshows
- [x] Add callback functions
- [x] Make sure slideshow initializes when not using data-src or data-srcset
- [x] Fix - clicking too soon after start skips slide transition for the first two slides
- [x] Add first image loaded callback
- [x] Add native support for prev/next buttons
- [x] Fix pause not working
- [x] Fix jump to second slide on click when slideshow is paused
- [x] Swipe to advance
- [x] Manually advancing a slide should transition quicker (or a custom time)
- [x] Wait until first image load to start timer

'''''''''''''''
