const debounce = require('lodash.debounce');
const processHtmlAttributes = require('../../common/html-attributes');
const emitAndFire = require('../../common/emit-and-fire');
const template = require('./template.marko');

const constants = {
    indexForNavigation: 2,
    minPagesRequired: 5,
    margin: 8
};

function getInitialState(input) {
    let prevItem;
    let nextItem;
    let tempObj;
    const items = [];
    const inputItems = input.items;
    const isRole = input.fakeLink || false;

    for (let i = 0; i < inputItems.length; ++i) {
        const item = inputItems[i];
        const href = item.href;
        const current = item.current;
        let role;

        if (isRole) {
            role = 'button';
        }

        tempObj = {
            role,
            href,
            current: Boolean(current),
            htmlAttributes: processHtmlAttributes(item),
            renderBody: item.renderBody
        };
        if (item.previous) {
            prevItem = tempObj;
            prevItem.class = 'pagination__previous';
            prevItem.disabled = Boolean(item.disabled) || !href;
            continue;
        }
        if (item.next) {
            nextItem = tempObj;
            nextItem.class = 'pagination__next';
            nextItem.disabled = Boolean(item.disabled) || !href;
            continue;
        }
        items.push(tempObj);
    }

    return {
        nextItem,
        prevItem,
        items,
        ariaLabelPrev: input.ariaLabelPrev || 'Previous page',
        ariaLabelNext: input.ariaLabelNext || 'Next page',
        currText: input.currText || 'Results Pagination - Page 1',
        classes: ['pagination', input.class],
        htmlAttributes: processHtmlAttributes(input)

    };
}

function getTemplateData(state) {
    return state;
}

function init() {
    this.pageContainerEl = this.el.querySelector('.pagination__items');
    this.pageEls = this.pageContainerEl.children;
    this.containerEl = this.el;
    this.subscribeTo(window).on('resize', debounce(() => this.refresh(), 20));
    this.refresh();
}

function refresh() {
    const containerWidth = this.containerEl.offsetWidth;
    const pageNumWidth = this.pageEls[0] + constants.margin;
    const numPagesAllowed = Math.floor(containerWidth / pageNumWidth) - constants.indexForNavigation;
    const adjustedNumPages = Math.max(numPagesAllowed, constants.minPagesRequired);
    const totalPages = this.pageEls.length;

    // Let's show all the pages that we can.
    for (let i = 0; i < adjustedNumPages; ++i) {
        if (this.pageEls[i].hasAttribute('aria-hidden')) {
            this.pageEls[i].removeAttribute('aria-hidden');
        }
    }
    // Now that we are showing all the pages that we can, lets hide remaining pages.
    for (let i = adjustedNumPages; i < totalPages; ++i) {
        this.pageEls[i].setAttribute('aria-hidden', true);
    }
}

function handlePageClick() {
    emitAndFire(this, 'pagination-select', { el: event.target });
}

function handleNextPage() {
    emitAndFire(this, 'pagination-next', { el: event.target });
}

function handlePreviousPage() {
    emitAndFire(this, 'pagination-previous', { el: event.target });
}

module.exports = require('marko-widgets').defineComponent({
    template,
    init,
    refresh,
    handlePageClick,
    handleNextPage,
    handlePreviousPage,
    getInitialState,
    getTemplateData
});

