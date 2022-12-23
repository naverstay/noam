import 'babel-polyfill';

import {subscribe, isSupported} from 'on-screen-keyboard-detector';
import {debounce, throttle} from 'throttle-debounce';
import 'jquery.easing';

(function () {
  let src = '//cdn.jsdelivr.net/npm/eruda';
  if (!/eruda=1/.test(window.location.search) && localStorage.getItem('active-eruda') != 'true') return;
  document.write('<scr' + 'ipt src="' + src + '"></scr' + 'ipt>');
  document.write('<scr' + 'ipt>eruda.init();</scr' + 'ipt>');
})();

let goTopTimer;
let prevScrollPos = 0;

function getScrollbarWidth() {
  // Creating invisible container
  const outer = document.createElement('div');
  outer.className = 'scroll-size';
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll'; // forcing scrollbar to appear
  outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
  document.body.appendChild(outer);

  // Creating inner element and placing it in the container
  const inner = document.createElement('div');
  outer.appendChild(inner);

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

  // Removing temporary elements from the DOM
  outer.parentNode.removeChild(outer);

  return scrollbarWidth;
}

const getBrowserScrollbarSize = () => {
  document.documentElement.style.setProperty("--app-scroll-size", `${getScrollbarWidth()}px`);
}

getBrowserScrollbarSize();

const isMobile = function () {
  return getComputedStyle(document.body, ':before').getPropertyValue('content') === '\"mobile\"';
}

const appHeight = (r) => {
  const doc = document.documentElement;
  const sab = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sab")) || 0;
  doc.style.setProperty("--app-height", `${Math.max(200, window.innerHeight - sab)}px`);
};

function getScrollTop() {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function watchMobileResolution() {
  const breakpoint = window.matchMedia('(min-width:1200px)');

  breakpoint.addEventListener("change", (e) => {
    if (!e.matches) {
      $('.hero-aside.js-collapse-block').scrollTop(0)
    }
  });
}

function checkWindowScroll() {
  clearTimeout(goTopTimer);
  const newScrollTop = getScrollTop();
  document.body.classList.toggle('__scroll', newScrollTop > 0);
  document.body.classList.toggle('__scroll-hide', newScrollTop > 100);
  document.body.classList.toggle('__scroll-up', newScrollTop === 0 ? false : prevScrollPos > newScrollTop);

  prevScrollPos = newScrollTop;
}

const debounceFitHeight = debounce(5, false, () => {
  appHeight("resize");
});

checkWindowScroll();

window.onscroll = function (e) {
  if (document.documentElement.classList.contains('open_autocomplete') || document.body.classList.contains('open_menu')) {
    try {
      document.documentElement.scrollTop = prevScrollPos;
    } catch (e) {
      console.log('onscroll', e);
    } finally {
      e.preventDefault();
      e.stopPropagation();
    }

  } else {
    checkWindowScroll(e);
  }
};

window.addEventListener("resize", () => {
  debounceFitHeight();
});

if (isSupported()) {
  const unsubscribe = subscribe(visibility => {
    appHeight('subscribe');
  });

  // After calling unsubscribe() the callback will no longer be invoked.
  //unsubscribe();
}

$(function ($) {
  $.throttle = throttle;
  $.debounce = debounce;

  appHeight('DOM');
  watchMobileResolution();
});
