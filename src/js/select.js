import 'select2';

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

$(function ($) {
  initSelect();
});
