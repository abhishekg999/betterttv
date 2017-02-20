const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');
const keyCodes = require('../../utils/keycodes');

function handleKeyEvent(keyup) {
    if ($('input, textarea, select').is(':focus')) return;

    const $player = $('#player');

    switch (keyup.keyCode) {
        case keyCodes.k:
            $player.find('.js-control-playpause-button').click();
            break;
        case keyCodes.f:
            $player.find('.js-control-fullscreen').click();
            break;
        case keyCodes.m:
            $player.find('.js-control-volume').click();
            break;
    }
}

let clicks = 0;
function handlePlayerClick() {
    clicks++;
    setTimeout(() => {
        if (clicks === 1) {
            var $player = $('#player');
            var isPaused = $player.data('paused');
            var playerService = App.__container__.lookup('service:persistent-player');
            if (!playerService || !playerService.playerComponent.player) return;
            if (!isPaused) playerService.playerComponent.player.pause();
        }
        clicks = 0;
    }, 250);
}

class VideoPlayerModule {
    constructor() {
        this.keybinds();
        watcher.on('load.channel', () => {
            this.viewerCount();
            this.clickToPause();
        });
        settings.add({
            id: 'clickToPlay',
            name: 'Click to Play/Pause Stream',
            defaultValue: false,
            description: 'Click on the twitch player to pause/resume playback'
        });
        settings.on('changed.clickToPlay', () => this.clickToPause());
    }

    viewerCount() {
        try {
            const controller = window.App && window.App.__container__.lookup('controller:channel');
            if (!controller || !controller.model || $('.player-viewer-count').length) return;

            $('div.player-livestatus').append('<span class="player-viewer-count"></span>');
            controller.model.addObserver('stream.viewers', (model, key) => {
                var label = Twitch.display.commatize(model.get(key)) + ' viewers';
                $('.player-viewer-count').text(label);
            });
        } catch (e) {}
    }

    keybinds() {
        $(document).on('keyup.playerControls', handleKeyEvent);
    }

    clickToPause() {
        $('#player').off('click', '.player-overlay.player-fullscreen-overlay', handlePlayerClick);

        if (settings.get('clickToPlay') === true) {
            $('#player').on('click', '.player-overlay.player-fullscreen-overlay', handlePlayerClick);
        }
    }
}

module.exports = new VideoPlayerModule();