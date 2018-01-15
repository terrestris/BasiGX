/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
 * Digitize Modify Object Button
 *
 * @class BasiGX.view.button.DigitizeModifyObject
 */
Ext.define('BasiGX.view.button.DigitizeModifyObject', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-digitize-modify-object',

    requires: [
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Modify an objetct',
            modifyObjectBtnText: 'Modify object',
            postItWindowTitle: 'Enter the Post-its text',
            postItInputTooLongText: 'The text you have entered is too long. ' +
                'Do you want to continue anyway?'
        }
    },

    /**
     *
     */
    bind: {
        text: '{modifyObjectBtnText}'
    },

    config: {
        map: null,
        collection: null,
        modifyInteraction: null,
        modifySelectInteraction: null,
        /**
         * The maximum length of text allowed for the postit
         */
        postitTextMaxLength: 130
    },

    name: 'modifyObjectBtn',
    toggleGroup: 'draw',

    listeners: {
        toggle: function(btn, pressed) {
            var me = this;
            if (!me.modifyInteraction) {
                me.modifySelectInteraction =
                   new ol.interaction.Select();
                me.modifySelectInteraction.on('select', function(evt) {
                    if (evt.selected && evt.selected[0]) {
                        var feature = evt.selected[0];
                        if (feature.get('isPostit')) {
                            me.modifyPostit(feature);
                        }
                    }
                    me.modifySelectInteraction.getFeatures().clear();
                });
                me.map.addInteraction(me.modifySelectInteraction);
                me.modifyInteraction = new ol.interaction.Modify({
                    features: me.redlineFeatures,
                    pixelTolerance: 20,
                    deleteCondition: function(event) {
                        return ol.events.condition
                            .singleClick(event);
                    }
                });
                me.map.addInteraction(me.modifyInteraction);
            }
            if (pressed) {
                me.modifyInteraction.setActive(true);
                me.modifySelectInteraction.setActive(true);
                me.modifyInteraction.on('modifyend',
                    me.fireRedliningChanged, me);
            } else {
                me.modifyInteraction.setActive(false);
                me.modifySelectInteraction.setActive(false);
                me.modifyInteraction.un('modifyend',
                    me.fireRedliningChanged, me);
            }
        }
    },

    /**
     * Fire a change event to inform other components
     */
    fireRedliningChanged: function() {
        this.fireEvent('redliningchanged');
    },

    /**
     * Modify a postit text.
     *
     * @param {ol.Feature} feature The vector feature.
     * @param {String} oldText The old text of the postit.
     */
    modifyPostit: function(feature, oldText) {
        var me = this;
        BasiGX.prompt(me.getViewModel().get('postItWindowTitle'), {
            fn: function(decision, text) {
                if (decision === 'ok') {
                    if (text.length > me.postitTextMaxLength) {
                        BasiGX.confirm(me.getViewModel().get(
                            'postItInputTooLongText'), {
                            fn: function(choice) {
                                if (choice === 'yes') {
                                    text = me.stringDivider(text, 16, '\n');
                                    me.setPostitStyleAndTextOnFeature(
                                        text, feature);
                                } else {
                                    me.modifyPostit(feature, text);
                                }
                            }
                        }
                        );
                    } else {
                        text = me.stringDivider(text, 16, '\n');
                        me.setPostitTextOnFeature(text, feature);
                    }
                }
            },
            multiline: 150,
            value: oldText
        });
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
    },

    /**
     * Sets a postit style and text on a feature.
     *
     * @param {String} text The text of the postit.
     * @param {ol.Feature} feat The vector feature.
     */
    setPostitTextOnFeature: function(text, feat) {
        // var me = this;
        // feat.setStyle(new ol.style.Style({
        //     image: new ol.style.Icon({
        //         anchorXUnits: 'fraction',
        //         anchorYUnits: 'pixels',
        //         opacity: 0.75,
        //         src: me.getPostitImgSrc()
        //     }),
        //     text: new ol.style.Text({
        //         text: text,
        //         scale: 1.5,
        //         offsetY: 80
        //     })
        // }));
        feat.getStyle().setText(new ol.style.Text({
            text: text,
            scale: 1.5,
            offsetY: 80
        }));
        // me.redlineFeatures.push(feat);
    }
});
