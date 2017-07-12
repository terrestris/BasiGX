/* Copyright (c) 2016-present terrestris GmbH & Co. KG
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
 * Gazetteer combo used to search in the glorious dataset of OSM.
 *
 * @class BasiGX.view.form.field.GazetteerCombo
 *
 */
Ext.define('BasiGX.view.form.field.GazetteerCombo', {
    extend: 'Ext.form.field.ComboBox',

    xtype: 'basigx_form_field_gazetteercombo',

    requires: [
        'BasiGX.util.Map'
    ],

    store: [],

    /**
     * Initializes the gazetteer combo component.
     */
    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        me.on('boxready', me.onBoxReady, me);
        me.on('change', me.onComboValueChange, me);
    },

    /**
     *
     */
    onBoxReady: function() {
        var me = this;
        me.nav = Ext.create('Ext.util.KeyNav', me.el, {
            esc: me.clearValue,
            scope: me
        });
    },

    /**
     * When the combo value changes, do a new gazetteer search.
     *
     * @param {BasiGX.view.form.field.GazetteerCombo} combo The combo.
     * @param {String} newValue The new selected value.
     */
    onComboValueChange: function(combo, newValue) {
        var me = this;
        var gazetteerGrid =
            Ext.ComponentQuery.query('basigx_grid_gazetteergrid')[0];

        if (newValue) {
            if (gazetteerGrid) {
                gazetteerGrid.show(combo);
            }
            me.doGazetteerSearch(newValue);
        } else {
            if (gazetteerGrid) {
                gazetteerGrid.getEl().slideOut('t', {
                    duration: 250,
                    callback: gazetteerGrid.onGazetteerGridSlideOut,
                    scope: gazetteerGrid
                });
            }
        }
    },

    /**
     * Modifies and then loads the store of the `basigx_grid_gazetteergrid`.
     *
     * @param {String} value The new selected value.
     */
    doGazetteerSearch: function(value) {
        var gazetteerGrid = Ext.ComponentQuery.query(
            'basigx_grid_gazetteergrid'
        )[0];
        var gazetteerStore = gazetteerGrid.getStore();
        var checkbox = gazetteerGrid.down('checkbox[name=limitcheckbox]');
        var limitToBBox = checkbox.getValue();

        gazetteerGrid.show();

        Ext.Ajax.abort(gazetteerStore._lastRequest);

        gazetteerStore.getProxy().setExtraParam('q', value);

        if (limitToBBox) {
            var map = BasiGX.util.Map.getMapComponent().getMap();
            var olView = map.getView();
            var projection = olView.getProjection().getCode();
            var bbox = map.getView().calculateExtent(map.getSize());
            var transformedBbox = ol.proj.transformExtent(bbox, projection,
                'EPSG:4326');
            gazetteerStore.getProxy().setExtraParam('viewboxlbrt',
                transformedBbox.toString());
        } else {
            gazetteerStore.getProxy().setExtraParam('viewboxlbrt', null);
        }
        gazetteerStore.load();
        gazetteerStore._lastRequest = Ext.Ajax.getLatest();
    }
});
