import 'babel-polyfill';
import 'magnific-popup';
import 'select2';

let Isotope = require('isotope-layout');
let jQueryBridget = require('jquery-bridget');
require('isotope-packery');
//require('isotope-fit-columns');
//require('isotope-cells-by-row');

jQueryBridget('isotope', Isotope, $);

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
  if (!state.id) {
    return state.text;
  }

  const icon = state.hasOwnProperty('element') ? state.element.getAttribute('data-icon') : '';

  if (!icon) {
    return state.text;
  }

  return $(`<span class="select2-selection__value">
        <span class="select2-selection__value-icon"><img src="${icon}" alt=""></span>
        <span>${state.text}</span>
      </span>`
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

const initIsotop = () => {
  const breakpoint = window.matchMedia('(min-width:768px)');

  const breakpointChecker = function (mobile) {
    console.log('breakpointChecker');
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


$(window).resize(function () {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    fitIsotopHeight();
  }, 50);
});

$(function ($) {
  initIsotop();

  fitIsotopHeight();

  $('.js-burger').on('click', function () {
    $('body').toggleClass('open_menu');
    return false;
  });

  $('.js-toggle-type').on('click', function () {
    let target = $($(this).attr('data-toggle'));

    if (target.length) {
      target.attr('type', target.attr('type') === 'password' ? 'text' : 'password');
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
    }

    return false;
  });

  initSelect();
});

