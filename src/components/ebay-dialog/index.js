const markoWidgets = require('marko-widgets');
const keyboardTrap = require('makeup-keyboard-trap');
const screenReaderTrap = require('makeup-screenreader-trap');
const emitAndFire = require('../../common/emit-and-fire');
const observer = require('../../common/property-observer');
const processHtmlAttributes = require('../../common/html-attributes');
const transition = require('../../common/transition');
const template = require('./template.marko');

function init() {
    this.dialog = this.getEl('dialog');
    observer.observeRoot(this, ['open']);
}

function getInitialState(input) {
    const { open = false, type, ariaLabelClose } = input;
    return {
        open,
        type,
        ariaLabelClose,
        class: input.class,
        htmlAttributes: processHtmlAttributes(input)
    };
}

function getTemplateData(state) {
    const { open, type, ariaLabelClose, htmlAttributes } = state;
    const dialogClass = [state.class, 'dialog'];
    const windowClass = ['dialog__window'];
    const maskClass = ['dialog__mask'];

    if (type) {
        windowClass.push(`dialog__window--${type}`);
    }

    switch (type) {
        case 'left':
        case 'right':
            windowClass.push('dialog__window--slide');
            maskClass.push('dialog__mask--fade-slow');
            break;
        case 'full':
        case 'fill':
        default:
            windowClass.push('dialog__window--fade');
            maskClass.push('dialog__mask--fade');
            break;
    }

    return {
        open,
        type,
        ariaLabelClose,
        dialogClass,
        windowClass,
        maskClass,
        htmlAttributes
    };
}


/**
 * Ensures that if a component is supposed to be trapped that this is
 * trapped after rendering.
 */
function trap(opts) {
    const { isTrapped: wasTrapped, restoreTrap } = this;
    const isTrapped = this.isTrapped = this.state.open;
    const shouldTransition = !(opts && opts.firstRender);

    if (restoreTrap || (isTrapped && !wasTrapped)) {
        screenReaderTrap.trap(this.dialog);
        keyboardTrap.trap(this.dialog);
        // Prevent body scrolling when a modal is open.
        document.body.style.overflow = 'hidden';
    }

    if (isTrapped !== wasTrapped) {
        const onFinishTransition = () => { this.cancelTransition = undefined; };

        if (this.cancelTransition) {
            this.cancelTransition();
        }

        if (isTrapped) {
            if (shouldTransition) {
                this.cancelTransition = transition(this.dialog, 'dialog--show', onFinishTransition);
            }

            this.dialog.removeAttribute('hidden');
            emitAndFire(this, 'dialog-show');
        } else {
            if (shouldTransition) {
                this.cancelTransition = transition(this.dialog, 'dialog--hide', onFinishTransition);
            }

            this.dialog.setAttribute('hidden', '');
            emitAndFire(this, 'dialog-close');
        }
    }
}

/**
 * Releases the trap before each render and on destroy so
 * that Marko can update normally without the inserted dom nodes.
 */
function release() {
    if (this.isTrapped) {
        this.restoreTrap = this.state.open;
        screenReaderTrap.untrap(this.dialog);
        keyboardTrap.untrap(this.dialog);
        // Restore body scrolling.
        document.body.style.overflow = 'auto'; // Auto instead of null/undefined for ie.
        if (document.body.getAttribute('style') === 'overflow: auto;') {
            // Remove style attribute if all that's left is the default overflow style.
            document.body.removeAttribute('style');
        }
    } else {
        this.restoreTrap = false;
    }
}

function show() {
    this.setState('open', true);
}

function close() {
    this.setState('open', false);
}

module.exports = markoWidgets.defineComponent({
    template,
    getInitialState,
    getTemplateData,
    init,
    onRender: trap,
    onBeforeUpdate: release,
    onBeforeDestroy: release,
    show,
    close
});
