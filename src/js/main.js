import 'babel-polyfill';
import 'magnific-popup';

import {subscribe, isSupported} from 'on-screen-keyboard-detector';

import './jquery.autocomplete.min';
import 'select2';
import {debounce, throttle} from 'throttle-debounce';
import Sly from 'sly-scrolling/dist/sly.min';
import 'jquery.easing';

(function () {
  let src = '//cdn.jsdelivr.net/npm/eruda';
  if (!/eruda=1/.test(window.location.search) && localStorage.getItem('active-eruda') != 'true') return;
  document.write('<scr' + 'ipt src="' + src + '"></scr' + 'ipt>');
  document.write('<scr' + 'ipt>eruda.init();</scr' + 'ipt>');
})();

//let Isotope = require('isotope-layout');
//let jQueryBridget = require('jquery-bridget');
//require('isotope-packery');
//require('isotope-fit-columns');
//require('isotope-cells-by-row');

//jQueryBridget('isotope', Isotope, $);

let $sly;
let resizeTimer;
let prevScrollPos = 0;
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
};

const appHeight = (r) => {
  const doc = document.documentElement;
  const sab = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sab")) || 0;
  doc.style.setProperty("--app-height", `${Math.max(200, window.innerHeight - sab)}px`);
};

const initAutocomplete = () => {
  let autocompleteInstance;
  let input = document.getElementById("js-autocomplete");
  let result = document.getElementById("js-autocomplete-result");

  let source = [];

  $('#js-autocomplete-source .card').each((si, s) => {
    source.push($(s))
  });

  $('.js-search-clear').on('click', function () {
    input.value = '';
    return false;
  });

  let countries = source.map(m => {
    return {
      value: m.find('.card-title').text(),
      data: {
        description: m.find('.card-title').text(),
        portal: m.find('.card-portal').text(),
        logo: m.find('.card-logo img').attr('src'),
        time: '09.12.21 11:56'
      }
    }
  });

  if (input) {
    autocompleteInstance = $(input).autocomplete({
      lookup: countries,
      minChars: 3,
      appendTo: result,
      preserveInput: true,
      showNoSuggestionNotice: true,
      noSuggestionNotice: 'Ничего не найдено',
      onSelect: function (suggestion) {
        console.log('You selected: ' + suggestion.value);
      },
      onSearchStart: function (params) {
        console.log('onSearchStart', params);
      },
      onSearchComplete: function (query, suggestions) {
        console.log('onSearchComplete', query, suggestions);

        $('html').addClass('open_autocomplete');
      },
      onHide: function (container) {
        console.log('onHide', container);
        $('html').removeClass('open_autocomplete');
        $(input).autocomplete('clear');
      },
      beforeRender: function (container, suggestions) {
        if (suggestions.length) {
          container.empty();

          suggestions.forEach((item, index) => {
            const itemElement = document.createElement("div");
            itemElement.className = 'autocomplete-item autocomplete-suggestion';
            itemElement.dataset.index = index;
            itemElement.innerHTML = `<div class="card">
                    <div class="card-info">
                      <span class="card-logo">
                        <img src="${item.data.logo}">
                        <span class="card-portal mob-only">${item.data.portal}</span>
                      </span>
                      <span class="card-views">${item.data.time}</span>
                    </div>
                    <div class="card-title"><span class="clr-red">${input.value}</span> ${item.value}</div>
                    <div class="card-description">description ${item.data.description}</div>
                  </div>`;

            container.append(itemElement);
          });
        }

        return container.attr('style', '');
      }
    });
  }
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

const initMapSlider = () => {
  let $frame = $('.js-map-slider');

  if ($frame.length) {
    // Call Sly on frame
    $sly = $frame.sly({
        scrollTrap: 1,
        horizontal: 1,
        itemNav: 'basic',
        smart: 1,
        keyboardNavBy: 'pages',
        //activateOn: 'click',
        mouseDragging: 1,
        touchDragging: 1,
        releaseSwing: 1,
        startAt: 0,
        activatePageOn: null,
        //scrollBar: $frame.parent().find('.js-hero-scrollbar'),
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
  prevScrollPos = getScrollTop();
  document.body.classList.toggle('__scroll', prevScrollPos > 0);
}

const debounceResize = debounce(5, false, () => {
  fitIsotopHeight();

  if ($sly) {
    $sly.sly('reload');
  }
});

const debounceFitHeight = debounce(5, false, () => {
  appHeight("resize");
});

function openPopup(target) {
  if (target) {
    $.magnificPopup.open({
      fixedContentPos: true,
      items: {
        src: target,
        type: 'inline'
      },
      //closeBtnInside: true,
      removalDelay: 100,
      //mainClass: 'mfp-zoom-in',
      //alignTop: isMobile ? true : false,
      callbacks: {
        open() {
          $('html').addClass('__open-popup');
          window.location.hash = target.attr('id');
        },
        close() {
          $('html').removeClass('__open-popup');
          window.location.hash = '';
        }
      }
    });

    $('.js-popup-close').on('click', function () {
      $.magnificPopup.close();
      return false;
    });
  }
}

checkWindowScroll();

$(window).on('load', function () {
  debounceResize();
});

window.onscroll = function (e) {
  if ($('html').hasClass('open_autocomplete')) {
    try {
      window.pageYOffset = document.documentElement.scrollTop = document.body.scrollTop = prevScrollPos;
    } catch (e) {
      console.log('onscroll', e);
    } finally {
      e.preventDefault();
      e.stopPropagation();
    }

  } else {
    checkWindowScroll();
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
  initHero();
  initMapSlider();
  initIsotop();
  initAutocomplete();

  $('.js-collapse-btn').on('click', function () {
    $(this).closest('.js-collapse-block').toggleClass('__expanded');
    return false;
  });

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
    let targetId = $(this).attr('data-popup');
    let target = $(targetId);

    $('body').removeClass('open_menu');

    openPopup(target);

    return false;
  });

  if (window.location.hash) {
    let popup = $(window.location.hash);

    if (popup.length) {
      openPopup(popup);
    }
  }

  initSelect();
});
