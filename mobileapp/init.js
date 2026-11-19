// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Moodle App support for resizing embedded question iframes.
 *
 * @package   filter_embedquestion
 * @copyright 2026 The Open University
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class AddonEmbedQuestionFilterHandler {

    constructor() {
        this.name = 'AddonEmbedQuestionFilterHandler';
        this.filterName = 'embedquestion';
        this.listenerRegistered = false;
        this.initialisedFrames = new WeakSet();
        this.handleResizeMessage = this.handleResizeMessage.bind(this);
    }

    isEnabled() {
        return true;
    }

    shouldBeApplied() {
        return true;
    }

    filter(text) {
        return text;
    }

    handleHtml(container) {
        const iframes = container.querySelectorAll('iframe.filter_embedquestion-iframe');
        if (!iframes.length) {
            return;
        }

        if (!this.listenerRegistered) {
            window.addEventListener('message', this.handleResizeMessage);
            this.listenerRegistered = true;
        }

        iframes.forEach((iframe) => {
            if (this.initialisedFrames.has(iframe)) {
                return;
            }

            this.initialisedFrames.add(iframe);
            iframe.addEventListener('load', () => this.requestResize(iframe));
            this.requestResize(iframe);
        });
    }

    requestResize(iframe) {
        const targetOrigin = new URL(iframe.src).origin;
        iframe.contentWindow.postMessage({
            type: 'filter_embedquestion:requestResize',
        }, targetOrigin);
    }

    handleResizeMessage(event) {
        if (!event.data || event.data.type !== 'filter_embedquestion:resize' ||
                !Number.isFinite(event.data.height) || event.data.height < 0) {
            return;
        }

        document.querySelectorAll('iframe.filter_embedquestion-iframe').forEach((iframe) => {
            if (event.source !== iframe.contentWindow || event.origin !== new URL(iframe.src).origin) {
                return;
            }

            iframe.style.height = `${event.data.height}px`;
        });
    }
}

this.CoreFilterDelegate.registerHandler(new AddonEmbedQuestionFilterHandler());
