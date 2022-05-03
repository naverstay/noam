import 'babel-polyfill';
import 'magnific-popup';
import 'select2';
import {debounce, throttle} from 'throttle-debounce';
import Sly from 'sly-scrolling/dist/sly.min';

require('jquery.easing');

//let Isotope = require('isotope-layout');
//let jQueryBridget = require('jquery-bridget');
//require('isotope-packery');
//require('isotope-fit-columns');
//require('isotope-cells-by-row');

//jQueryBridget('isotope', Isotope, $);

let $sly;
let resizeTimer
let watchCardHeight = false;
let isotopInstances = [];
const isotopOptions = {
  layoutMode: 'packery',
  //layoutMode: 'fitColumns',
  //layoutMode: 'cellsByRow',
  //percentPosition: true,
  stagger: 0,
  transitionDuration: 100,
  itemSelector: '.grid-item'
  //packery: {
  //  columnWidth: '.grid-sizer',
  //  rowHeight: '.grid-sizer'
  //}
};

const isMobile = function () {
  return getComputedStyle(document.body, ':before').getPropertyValue('content') === '\"mobile\"';
}

const applyGroupHeight = (group, height) => {
  group.forEach((item) => item.css('height', height + 'px'));
}

const fitIsotopHeight = () => {
  $('.js-grid .grid-item').css('height', '');

  $('.js-grid').each((i, grid) => {
    let sizer = $(grid).find('.grid-sizer');
    //let sizeW = Math.ceil(sizer[0].getBoundingClientRect().height);
    let maxColHeight = 0;
    let prevTop = 0;
    let rowGroup = [];

    if (watchCardHeight) {
      const items = $(grid).find('.grid-item');

      items.each((i, elem) => {
        let item = $(elem);

        if (item.hasClass('__h-2')) {
          // todo skip
        } else {
          let h = Math.ceil(item[0].getBoundingClientRect().height)
          let top = Math.ceil(item[0].getBoundingClientRect().top)

          if (prevTop === 0) {
            prevTop = top
          }

          maxColHeight = Math.max(maxColHeight, h);

          if (top === prevTop) {
            rowGroup.push(item);
          } else {
            applyGroupHeight(rowGroup, maxColHeight);
            maxColHeight = h;
            prevTop = top;
            rowGroup = [item];
          }

          //if (i === items.length - 1) {
          //  applyGroupHeight(rowGroup, maxColHeight);
          //}
        }

        //item.css('height', (item.hasClass('__h-2') ? sizeW * 2 : item.hasClass('__no-img') ? 150 : sizeW) + 'px')
      });
    }

    $(grid).addClass('__loaded');
  });
}

const formatBrandResult = state => {
  if (!state.id) {
    return state.text;
  }

  const icon = state.hasOwnProperty('element') ? state.element.getAttribute('data-icon') : '';

  if (!icon) {
    return state.text;
  }

  return $(`<span class="select2-results__option-value">
      <span class="select2-results__option-icon"><img src="${icon}" alt=""></span>
      <span class="select2-results-name">${state.text}</span>
    </span>`
  );
};

const formatBrandSelection = state => {
  let chevronSvg = '<span class="select2-selection__chevron"><svg class="btn-icon"><use xlink:href="/assets/sprite/icon.svg#icon_arrow_d"></use></svg></span>';

  if (!state.id) {
    return $(`<span>${state.text}</span>` + chevronSvg);
  }

  const icon = state.hasOwnProperty('element') ? state.element.getAttribute('data-icon') : '';

  if (!icon) {
    return $(`<span>${state.text}</span>` + chevronSvg);
  }

  return $(`<span class="select2-selection__value">
        <span class="select2-selection__value-icon"><img src="${icon}" alt=""></span>
        <span>${state.text}</span>
      </span>` + chevronSvg
  );
};

const initSelect = () => {
  $('.js-select-icon').each((index, select) => {
    let selectSearch = $(select);

    selectSearch.select2({
      width: '100%',
      minimumResultsForSearch: 10,
      //tags: selectSearch.hasClass('select_tags'),
      dropdownParent: selectSearch.parent(),
      templateResult: formatBrandResult,
      templateSelection: formatBrandSelection
    });
  });
}

const appHeight = () => {
  const doc = document.documentElement;
  const sab = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sab")) || 0;
  doc.style.setProperty("--app-height", `${Math.max(700, window.innerHeight - sab)}px`);
};

const initHero = () => {
  let $frame = $('.js-hero-slider');

  if ($frame.length) {

    // Call Sly on frame
    $sly = $frame.sly({
        scrollTrap: 1,
        horizontal: 1,
        itemNav: 'basic',
        smart: 1,
        keyboardNavBy: 'pages',
        activateOn: 'click',
        mouseDragging: 1,
        touchDragging: 1,
        releaseSwing: 1,
        startAt: 0,
        activatePageOn: null,
        scrollBar: $frame.parent().find('.js-hero-scrollbar'),
        scrollBy: 1,
        speed: 1000,
        elasticBounds: 1,
        easing: 'easeOutExpo',
        dragHandle: 1,
        dynamicHandle: 1,
        clickBar: 1,
        minHandleSize: 50
      },
      {
        load: function () {
          $frame.parent().addClass('__loaded');


        },
        move: [
          function () {

          },
          function () {

          }
        ]
      });
  }
}

const initIsotop = () => {
  const breakpoint = window.matchMedia('(min-width:768px)');

  const breakpointChecker = function (mobile) {
    watchCardHeight = !mobile;
    return false;
  };

  //const enableGrid = function () {
  //  if (isotopInstances.length) {
  //    isotopInstances.forEach((iso, i) => {
  //      iso.isotope(isotopOptions);
  //    });
  //  } else {
  //    $('.js-grid').each((i, elem) => {
  //      let iso = $(elem).isotope(isotopOptions);
  //      isotopInstances.push(iso);
  //    });
  //  }
  //};
  //
  //const breakpointChecker = function (mobile) {
  //  if (mobile) {
  //    if (isotopInstances.length) {
  //      isotopInstances.forEach((iso, i) => {
  //        iso.isotope('destroy');
  //      });
  //    }
  //    return false;
  //  } else {
  //    return enableGrid();
  //  }
  //};

  breakpoint.addEventListener("change", (e) => {
    breakpointChecker(!e.matches);
  });

  breakpointChecker(isMobile());
}

function getScrollTop() {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function checkWindowScroll() {
  document.body.classList.toggle('__scroll', getScrollTop() > 0);
}

checkWindowScroll();

const debounceResize = debounce(5, false, () => {
  fitIsotopHeight();

  if ($sly) {
    $sly.sly('reload');
  }
});

$(window).on('resize load', function () {
  debounceResize();
});

window.onscroll = function () {
  checkWindowScroll();
};

window.addEventListener("resize", appHeight);

$(function ($) {
  $.throttle = throttle;
  $.debounce = debounce;

  appHeight();
  initHero();
  initIsotop();

  $('.js-burger').on('click', function () {
    $('body').toggleClass('open_menu');
    return false;
  });

  $('.js-toggle-type').on('click', function () {
    let btn = $(this)
    let target = $(btn.attr('data-toggle'));

    if (target.length) {
      let hide = target.attr('type') === 'password';
      target.attr('type', hide ? 'text' : 'password');
      btn.toggleClass('__open', hide);
    }

    return false;
  });

  $('.js-popup').on('click', function () {
    let target = $($(this).attr('data-popup'));

    if (target) {
      $.magnificPopup.open({
        fixedContentPos: true,
        items: {
          src: target,
          type: 'inline'
        }
      });

      $('.js-popup-close').on('click', function () {
        $.magnificPopup.close();
        return false;
      });
    }

    return false;
  });

  initSelect();
});

