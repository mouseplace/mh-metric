// ==UserScript==
// @name         🐭️ MouseHunt - Metric
// @version      1.0.1
// @description  Convert mice weight to metric.
// @license      MIT
// @author       bradp
// @namespace    bradp
// @match        https://www.mousehuntgame.com/*
// @icon         https://i.mouse.rip/mouse.png
// @grant        none
// @run-at       document-end
// ==/UserScript==

((function () {
  'use strict';

  /**
   * Do something when the overlay is shown or hidden.
   *
   * @param {Object}   callbacks
   * @param {Function} callbacks.show   The callback to call when the overlay is shown.
   * @param {Function} callbacks.hide   The callback to call when the overlay is hidden.
   * @param {Function} callbacks.change The callback to call when the overlay is changed.
   */
  const onOverlayChange = (callbacks) => {
    const observer = new MutationObserver(() => {
      if (callbacks.change) {
        callbacks.change();
      }

      if (document.getElementById('overlayBg').classList.length > 0) {
        if (callbacks.show) {
          callbacks.show();
        }
      } else if (callbacks.hide) {
        callbacks.hide();
      }
    });
    observer.observe(
      document.getElementById('overlayBg'),
      {
        attributes: true,
        attributeFilter: ['class']
      }
    );
  };

  /**
   * Convert the text in the given element to metric.
   *
   * @param {Node} elements Array of elements to convert.
   */
  const replaceImperialWithMetric = (elements) => {
    elements.forEach((element) => {
      // Grab the lb. and oz. values.
      const lb = element.innerText.match(/(\d+? )lb./i);
      const oz = element.innerText.match(/(\d+? )oz./i);
      if (! (lb || oz)) {
        return;
      }

      // Convert the lb. and oz. values to metric.
      const lbValue = lb ? lb[ 1 ] : 0;
      const ozValue = oz ? oz[ 1 ] : 0;
      const totalWeight = parseInt(lbValue) + (parseInt(ozValue) / 16);
      const totalWeightMetric = (Math.round((totalWeight * 0.45359237) * 100) / 100).toString();

      // Replace the lb. and oz. values with the metric values.
      element.innerHTML = element.innerHTML.replace(/(\d+? lb.\s)?(\d+? oz.)/i, totalWeightMetric + ' kg. ');
    });
  };

  /**
   * Replace text in the mouse overlay / mouse page.
   */
  const replaceMouseOverlay = () => {
    const elements = document.querySelectorAll('.mouseView-statsContainer-block-padding table tr td');

    const avgIndex = Array.from(elements).findIndex((element) => element.innerText.match(/Avg. Weight:/i));
    const heaviestIndex = Array.from(elements).findIndex((element) => element.innerText.match(/Heaviest:/i));

    if (avgIndex !== -1) {
      if (elements[ avgIndex + 1 ]) {
        replaceImperialWithMetric([elements[ avgIndex + 1 ]]);
      }
    }
    if (heaviestIndex !== -1) {
      if (elements[ heaviestIndex + 1 ]) {
        replaceImperialWithMetric([elements[ heaviestIndex + 1 ]]);
      }
    }
  };

  replaceImperialWithMetric(document.querySelectorAll('.journal .entry .journalbody .journaltext'));
  onOverlayChange({
    show: () => {
      // Run immediately, then again in quick succession to make sure the weight is updated.
      replaceMouseOverlay();
      setTimeout(() => {
        replaceMouseOverlay();
      }, 250);
      setTimeout(() => {
        replaceMouseOverlay();
      }, 500);
    }
  });
})());
