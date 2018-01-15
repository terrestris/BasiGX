/* Copyright (c) 2018-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Digitize Postit Button
 *
 * @class BasiGX.view.button.DigitizePostit
 */
Ext.define('BasiGX.view.button.DigitizePostit', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-digitize-postit',

    requires: [
        'Ext.Loader'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Draw Post-it',
            drawPostItBtnText: 'Draw Post-it',
            postItWindowTitle: 'Enter the Post-its text',
            postItWindowCreatePostItBtnText: 'Create Post-it',
            postItInputTooLongText: 'The text you have entered is too long. ' +
                'Do you want to continue anyway?'
        }
    },

    /**
     *
     */
    bind: {
        text: '{drawPostItBtnText}'
    },

    config: {
        /**
         * The ol map. required.
         */
        map: null,

        /**
         * The ol collection to work on. required.
         */
        collection: null,

        /**
         * The URL to a picture used for the postits.
         *
         * It is highly recommended that you set your own image source here
         */
        postitPictureUrl: null,

        /**
         * The maximum length of text allowed for the postit
         */
        postitTextMaxLength: 130,

        /**
         *
         */
        drawPostitInteraction: null
    },

    name: 'postitbutton',
    toggleGroup: 'draw',

    listeners: {
        toggle: function(btn, pressed) {
            var me = this;
            if (!me.drawPostitInteraction) {
                var src = me.getPostitImgSrc();

                me.drawPostitInteraction = new ol.interaction.Draw({
                    features: new ol.Collection(),
                    type: 'Point',
                    style: new ol.style.Style({
                        image: new ol.style.Icon({
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            opacity: 0.75,
                            src: src
                        })
                    })
                });
                me.map.addInteraction(me.drawPostitInteraction);
            }
            if (pressed) {
                me.drawPostitInteraction.setActive(true);
                me.drawPostitInteraction.on('drawend',
                    me.setDefaultPostitStyle, me);
            } else {
                me.drawPostitInteraction.setActive(false);
                me.drawPostitInteraction.un('drawend',
                    me.setDefaultPostitStyle, me);
            }
        }
    },

    /**
     * Returns a usable image `src` for the postit; this will either be the
     * configured one (#postitPictureUrl), or it will be tried to be determined
     * from the path of the sourcefile of the redlining component itself (which
     * might be error-prone).
     *
     * The safest bet is to configure an explicit `postitPictureUrl`.
     *
     * @return {String} A image `src` for the postit image.
     */
    getPostitImgSrc: function() {
        if (this.getPostitPictureUrl() !== null) {
            return this.getPostitPictureUrl();
        } else {
            var classPath = Ext.Loader.getPath(
                'BasiGX.view.button.DigitizePostit'
            );
            var imageBaseSrc;
            if (classPath) {
                imageBaseSrc = classPath.split(
                    'src/view/button/DigitizePostit.js')[0];
            }
            return imageBaseSrc + 'resources/img/postit.png';
        }
    },


    /**
     * Called after a postit is drawn, this will set a default postit style.
     *
     * @param {ol.interaction.Draw.Event} evt The `drawend`-event.
     */
    setDefaultPostitStyle: function(evt) {
        var me = this;
        var feature = evt.feature;
        if (feature) {
            feature.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 0.75,
                    src: me.getPostitImgSrc()
                })
            }));
            var clone = evt.feature.clone();
            me.handlePostitAdd(clone);
        }
    },

    /**
     * Handles adding of a new postit.
     *
     * @param {ol.Feature} feat The vector feature.
     * @param {String} oldText The old text of the postit.
     */
    handlePostitAdd: function(feat, oldText) {
        var me = this;

        feat.set('isPostit', true);

        BasiGX.prompt(me.getViewModel().get('postItWindowTitle'), {
            fn: function(decision, text) {
                if (decision === 'cancel') {
                    me.collection.remove(feat);
                } else {
                    if (text.length > me.postitTextMaxLength) {
                        BasiGX.confirm(me.getViewModel().get(
                            'postItInputTooLongText'), {
                                fn: function(choice) {
                                    if (choice === 'yes') {
                                        text = me.stringDivider(text, 16, '\n');
                                        me.setPostitStyleAndTextOnFeature(
                                            text, feat);
                                    } else {
                                        me.handlePostitAdd(feat, text);
                                    }
                                }
                            }
                        );
                    } else {
                        text = me.stringDivider(text, 16, '\n');
                        me.setPostitStyleAndTextOnFeature(text, feat);
                    }
                }
            },
            multiline: 150,
            value: oldText
        });

        var button = Ext.ComponentQuery.query('button[name=postitbutton]')[0];
        button.toggle(false);
    },

    /**
     * Sets a postit style and text on a feature.
     *
     * @param {String} text The text of the postit.
     * @param {ol.Feature} feat The vector feature.
     */
    setPostitStyleAndTextOnFeature: function(text, feat) {
        var me = this;
        feat.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: me.getPostitImgSrc()
            }),
            text: new ol.style.Text({
                text: text,
                scale: 1.5,
                offsetY: 80
            })
        }));
        me.collection.push(feat);
    },


    /**
     * Returns a string that is wrapped: every ~`width` chars a space is
     * replaced with the passed `spaceReplacer`.
     *
     * See http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
     *
     * @param {String} str The string to wrap.
     * @param {Number} width The width of a line (number of characters).
     * @param {String} spaceReplacer The string to replace spaces with.
     * @return {String} The 'wrapped' string.
     */
    stringDivider: function(str, width, spaceReplacer) {
        var me = this;
        var startIndex = 0;
        var stopIndex = width;
        if (str.length > width) {
            var p = width;
            var left;
            var right;
            while (p > 0 && (str[p] !== ' ' && str[p] !== '-')) {
                p--;
            }
            if (p > 0) {
                if (str.substring(p, p + 1) === '-') {
                    left = str.substring(0, p + 1);
                } else {
                    left = str.substring(0, p);
                }
                right = str.substring(p + 1);
                return left + spaceReplacer + me.stringDivider(
                    right, width, spaceReplacer);
            } else {
                // no whitespace or - found, splitting hard on the width length
                left = str.substring(startIndex, stopIndex + 1) + '-';
                right = str.substring(stopIndex + 1);
                startIndex = stopIndex;
                stopIndex += width;
                return left + spaceReplacer + me.stringDivider(
                    right, width, spaceReplacer);
            }
        }
        return str;
    }
});
