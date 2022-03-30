import View from './view.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentEl = document.querySelector('.pagination');

  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.recipes.length / this._data.resultsPerPage
    );

    // Page 1 and there are other pages
    if (curPage === 1 && numPages > 1) {
      return `${this._generatePagesMarkup(numPages)}${this._generateNextMarkup(
        curPage
      )}`;
    }
    // last page
    if (curPage === numPages && numPages > 1) {
      return `${this._generatePagesMarkup(numPages)}${this._generatePrevMarkup(
        curPage
      )}`;
    }
    //Other page
    if (curPage < numPages) {
      return `${this._generatePagesMarkup(numPages)}${this._generatePrevMarkup(
        curPage
      )}${this._generateNextMarkup(curPage)}`;
    }
    // Page 1 and there are no other pages
    return ``;
  }

  _generatePagesMarkup(numPages) {
    return `<div class="span__inline"><span>-${numPages}-</span></div>`;
  }

  _generateNextMarkup(curPage) {
    return ` <button data-goto="${
      curPage + 1
    }" class="btn--inline pagination__btn--next">
    <span>Page ${curPage + 1}</span>
    <svg class="search__icon">
      <use href="${icons}#icon-arrow-right"></use>
    </svg>
  </button>`;
  }

  _generatePrevMarkup(curPage) {
    return `<button data-goto="${
      curPage - 1
    }" class="btn--inline pagination__btn--prev">
    <svg class="search__icon">
      <use href="${icons}#icon-arrow-left"></use>
    </svg>
    <span>Page ${curPage - 1}</span>
  </button>`;
  }

  addHandlerClick(handler) {
    this._parentEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const goto = btn.dataset.goto;
      handler(Number(goto));
    });
  }
}

export default new PaginationView();
