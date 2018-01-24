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
 * Digitize Modify Object Button
 *
 * @class BasiGX.view.button.DigitizeModifyObject
 */
Ext.define('BasiGX.view.button.DigitizeModifyObject', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-digitize-modify-object',

    requires: [
        'BasiGX.util.Digitize'
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
        /**
         * The ol map. required.
         */
        map: null,

        /**
         * The ol collection to work on. required.
         */
        collection: null,

        /**
         *
         */
        modifyInteraction: null,

        /**
         *
         */
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
                    features: me.collection,
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
                    me.fireFeatureChanged, me);
            } else {
                me.modifyInteraction.setActive(false);
                me.modifySelectInteraction.setActive(false);
                me.modifyInteraction.un('modifyend',
                    me.fireFeatureChanged, me);
            }
        },
        beforedestroy: function() {
            if (this.modifyInteraction) {
                this.map.removeInteraction(this.modifyInteraction);
            }
            if (this.modifySelectInteraction) {
                this.map.removeInteraction(this.modifySelectInteraction);
            }
        }
    },

    /**
     * Fire a change event to inform other components
     */
    fireFeatureChanged: function() {
        this.fireEvent('featurechanged');
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
                                    text = BasiGX.util.Digitize.
                                        stringDivider(text, 16, '\n');
                                    me.setPostitStyleAndTextOnFeature(
                                        text, feature);
                                } else {
                                    me.modifyPostit(feature, text);
                                }
                            }
                        });
                    } else {
                        text = BasiGX.util.Digitize.
                            stringDivider(text, 16, '\n');
                        me.setPostitTextOnFeature(text, feature);
                    }
                }
            },
            multiline: 150,
            value: oldText
        });
    },

    /**
     * Sets a postit text on a feature.
     *
     * @param {String} text The text of the postit.
     * @param {ol.Feature} feat The vector feature.
     */
    setPostitTextOnFeature: function(text, feat) {
        feat.getStyle().getText().setText(text);
        this.fireFeatureChanged();
    }
});
