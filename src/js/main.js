import 'magnific-popup';

import './jquery.autocomplete.min';
import 'select2';
import Sly from 'sly-scrolling/dist/sly.min';
import 'jquery.easing';
import {debounce} from "throttle-debounce";

let $sly;

const isJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
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

const initInputAutocomplete = () => {
  $('.js-input-autocomplete').each((index, input) => {
    let result = input.parentElement;
    let inputIcon = result.querySelector('.js-input-icon');
    let autocomplete = input.dataset.autocomplete;
    let source = [];

    if (!autocomplete) {
      return;
    }

    if (isJsonString(autocomplete)) {
      let data = JSON.parse(autocomplete);

      if (data.length) {
        for (let i = 0; i < data.length; i++) {
          source.push(data[i]);
        }
      }
    }

    $(input).autocomplete({
      lookup: source,
      minChars: 1,
      appendTo: result,
      preserveInput: true,
      showNoSuggestionNotice: true,
      noSuggestionNotice: `<span class="select2-results__option-value"><span class="select2-results-name">Ничего не найдено</span></span>`,
      onSelect: function (suggestion) {
        console.log('onSelect', suggestion);
        input.value = suggestion.value;

        if (inputIcon) {
          inputIcon.innerHTML = `<img src="${suggestion.data.icon}" alt="${suggestion.data.label}">`;
        }
      },
      onSearchStart: function (params) {
        console.log('onSearchStart', params);
      },
      onSearchComplete: function (query, suggestions) {
        console.log('onSearchComplete', query, suggestions);
      },
      onHide: function (container) {

      },
      beforeRender: function (container, suggestions) {
        if (suggestions.length) {
          container.empty();

          suggestions.forEach((item, index) => {
            const itemElement = document.createElement("div");
            itemElement.className = 'select2-results__option select2-results__option--selectable autocomplete-suggestion';
            itemElement.dataset.index = index;
            itemElement.innerHTML = `<span class="select2-results__option-value"><span class="select2-results-name">${item.data.label}</span></span>`;

            container.append(itemElement);
          });
        }

        return container.attr('style', '');
      }
    });

  });
};

const initAutocomplete = () => {
  let autocompleteInstance;
  const $input = $("#js-autocomplete");
  const $result = $("#js-autocomplete-result");
  const $html = $('html');

  let source = [];

  $('#js-autocomplete-source .card').each((si, s) => {
    source.push($(s))
  });

  $('.js-search-clear').on('click', function () {
    $input.value = '';
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

  if ($input.length) {
    autocompleteInstance = $input.autocomplete({
      lookup: countries,
      minChars: 3,
      appendTo: $result,
      preserveInput: true,
      showNoSuggestionNotice: true,
      triggerSelectOnValidInput: false,
      noSuggestionNotice: 'Ничего не найдено',
      onSelect: function (suggestion) {
        console.log('onSelect', suggestion);
        console.log('You selected: ' + suggestion.value);
        $input.val('');
        $result.find('.autocomplete-suggestions').empty();
      },
      onSearchStart: function (params) {
        console.log('onSearchStart', params);
      },
      onSearchComplete: function (query, suggestions) {
        console.log('onSearchComplete', query, suggestions);

        $html.addClass('open_autocomplete');
      },
      onHide: function (container) {
        $html.removeClass('open_autocomplete');
      },
      beforeRender: function (container, suggestions) {
        if (suggestions.length) {
          const text = $input.val();
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
                    <div class="card-title"><span class="clr-red">${text}</span> ${item.value}</div>
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

const debounceResize = debounce(5, false, () => {
  //fitIsotopHeight();

  if ($sly) {
    $sly.sly('reload');
  }
});

$(window).on('load', function () {
  debounceResize();
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

$(function ($) {
  initHero();
  initMapSlider();
  initAutocomplete();

  $('.js-collapse-btn').on('click', function () {
    let btn = $(this);
    let action = btn.attr('data-action');

    if (action) {
      btn.closest('.js-collapse-block')[action]('__expanded');
    } else {
      btn.closest('.js-collapse-block').toggleClass('__expanded');
    }

    return false;
  });

  $('.js-burger').on('click', function () {
    $('body').toggleClass('open_menu');
    return false;
  });

  $('.js-nav-dropdown').on('click', function () {
    $(this).parent().toggleClass('__opened');
    return false;
  });

  $('.js-more-tags').on('click', function () {
    $(this).toggleClass('__opened');
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
  initInputAutocomplete();
});
