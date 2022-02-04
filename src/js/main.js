import 'babel-polyfill';

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


$(window).resize(function () {
  fitIsotopHeight();
});

$(function ($) {
  fitIsotopHeight();

  $('.js-burger').on('click', function () {
    $('body').toggleClass('open_menu');
    return false;
  });

  const breakpoint = window.matchMedia('(min-width:768px)');

  const enableGrid = function () {
    $('.js-grid').each((i, elem) => {
      $(elem).isotope({
        layoutMode: 'packery',
        percentPosition: true,
        stagger: 0,
        transitionDuration: 100,
        itemSelector: '.grid-item',
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
        $(elem).isotope('destroy');
      });

      return false;
    }
  };

  breakpoint.addListener(breakpointChecker);

  breakpointChecker();

});

