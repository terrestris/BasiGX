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
 * Merge selected features button
 *
 * Merge selected features into the currently selected layer.
 *
 * @class BasiGX.view.button.MergeSelection
 */
Ext.define('BasiGX.view.button.MergeSelection', {
    extend: 'Ext.button.Button',
    xtype: 'basigx-button-mergeselection',

    requires: [
        'Ext.window.Window',
        'Ext.app.ViewModel',
        'BasiGX.view.form.CoordinateTransform',
        'BasiGX.util.Animate',
        'BasiGX.view.window.MergeWindow'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Selektierte Features in diesen Layer übernehmen',
            text: 'Features übernehmen'
        }
    },

    /**
     *
     */
    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },

    /**
     *
     */
    config: {
        handler: function() {
            var me = this;
            var grid;
            var parent = this.up('window');
            // support embedding the feature grid anywhere
            if (!parent && this.config.featureGridSelectorFn) {
                grid = this.config.featureGridSelectorFn.call(this);
            } else {
                grid = parent.down('basigx-grid-featuregrid');
            }

            var targetLayer = grid.getLayer();
            Ext.create({
                xtype: 'basigx-window-merge',
                sourceLayer: this.getSourceLayer(),
                targetLayer: targetLayer,
                extraTargetLayers: this.getExtraTargetLayers(),
                mergedFeaturesFn: function(features) {
                    me.getMergedFeaturesFn()(features);
                }
            });
        },
        /**
         * The source layer name.
         * @type {ol.layer.Vector}
         */
        sourceLayer: null,
        /**
         * A function to obtain the feature grid.
         */
        featureGridSelectorFn: null,
        /**
         * Optional extra target layers to put the features into.
         * @type {ol.layer.Vector[]}
         */
        extraTargetLayers: null,
        /**
         * Optional callback function to get notified once the features have
         * been merged.
         * @type {Function} which will receive the features that have been
         * merged
         */
        mergedFeaturesFn: null
    }
});
