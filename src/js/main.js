import 'babel-polyfill';
import 'magnific-popup';
import 'select2';

let Isotope = require('isotope-layout');
let jQueryBridget = require('jquery-bridget');
require('isotope-packery');

jQueryBridget('isotope', Isotope, $);

const isMobile = function () {
  return getComputedStyle(document.body, ':before').getPropertyValue('content') === '\"mobile\"';
}

const fitIsotopHeight = () => {
  $('.js-grid').each((i, grid) => {
    let sizer = $(grid).find('.grid-sizer');
    let sizeW = Math.ceil(sizer[0].getBoundingClientRect().height);

    $(grid).find('.grid-item').each((i, elem) => {
      let item = $(elem);
      item.css('height', (item.hasClass('__h-2') ? sizeW * 2 : item.hasClass('__no-img') ? 150 : sizeW) + 'px')
    });
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

  const enableGrid = function () {
    $('.js-grid').each((i, elem) => {
      $(elem).isotope({
        layoutMode: 'packery',
        percentPosition: true,
        stagger: 0,
        transitionDuration: 100,
        itemSelector: '.grid-item'
        //packery: {
        //  columnWidth: '.grid-sizer',
        //  rowHeight: '.grid-sizer'
        //}
      });
    });
  };

  const breakpointChecker = function () {
    console.log('isMobile', isMobile());
    if (!isMobile()) {
      return enableGrid();
    } else {
      $('.js-grid').each((i, elem) => {
        try {
          $(elem).isotope('destroy');
        } catch (e) {

        }
      });

      return false;
    }
  };

  breakpoint.addListener(breakpointChecker);

  breakpointChecker();
}


$(window).resize(function () {
  fitIsotopHeight();
});

$(function ($) {
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
        items: {
          src: target,
          type: 'inline'
        }
      });
    }

    return false;
  });

  initIsotop();

  initSelect();
});

