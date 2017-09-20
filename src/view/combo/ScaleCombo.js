/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * ScaleCombo
 *
 * Lets the user control the maps scale with a combobox
 *
 * @class BasiGX.view.combo.ScaleCombo
 */
Ext.define('BasiGX.view.combo.ScaleCombo', {
    xtype: 'basigx-combo-scale',
    extend: 'Ext.form.field.ComboBox',
    requires: [
    ],

    viewModel: {
        data: {
            fieldLabel: null,
            documentation: '<h2>Maßstabswahl</h2>• Wählen Sie mit Hilfe ' +
                'dieser ComboBox den gewünschten Maßstab aus.<br>• Zoomen ' +
                'Sie innerhalb der Karte, so aktualisiert sich die ComboBox ' +
                'entsprechend mit dem aktuellen Maßstab'
        }
    },

    bind: {
        fieldLabel: '{fieldLabel}'
    },

    /**
     *
     */
    queryMode: 'local',

    /**
     *
     */
    forceSelection: false,

    /**
     *
     */
    allowBlank: false,

    /**
     *
     */
    width: 120,

    /**
     *
     */
    editable: false,

    /**
     *
     */
    displayField: 'scale',

    /**
     *
     */
    valueField: 'resolution',

    /**
     *
     */
    fields: ['scale', 'resolution'],

    /**
     * Will hold the event keys of any listeners we bind to openlayers objects,
     * so that we can unbind them once we get destroyed.
     *
     * @private
     */
    boundEventKeys: [],

    /**
     *
     */
    map: null,

    config: {
        /**
         *
         */
        scales: [
            {scale: '1:2.000.000', resolution: 560},
            {scale: '1:1.000.000', resolution: 280},
            {scale: '1:500.000', resolution: 140},
            {scale: '1:250.000', resolution: 70},
            {scale: '1:100.000', resolution: 28},
            {scale: '1:50.000', resolution: 14},
            {scale: '1:25.000', resolution: 7},
            {scale: '1:10.000', resolution: 2.8},
            {scale: '1:5.000', resolution: 1.4},
            {scale: '1:2.500', resolution: 0.7},
            {scale: '1:1.000', resolution: 0.28},
            {scale: '1:500', resolution: 0.14}
        ]
    },

    /**
     *
     */
    initComponent: function() {
        var me = this;

        if (!me.map) {
            me.map = BasiGX.util.Map.getMapComponent().getMap();
        }
        var mapView = me.map.getView();

        // using hard scales here as there is no way currently known to
        // retrieve all resolutions from the map
        var scaleStore = Ext.create('Ext.data.Store', {
            sorters: [{
                property: 'resolution',
                direction: 'DESC'
            }],
            data: me.getScales()
        });

        me.store = scaleStore;

        me.callParent();

        // set the correct default value
        me.setValue(mapView.getResolution());

        // register listeners to update combo and map
        me.on('select', me.onComboSelect, me);

        // eventually update the combo when map-resolution changes
        var bufferedUpdateMapResChange = Ext.Function.createBuffered(
            me.updateComboOnMapChange, 50, me
        );
        var key = mapView.on('change:resolution', bufferedUpdateMapResChange);
        me.boundEventKeys.push(key);
    },

    /**
     * Unregister any listeners we may have added to openlayers components when
     * the combo is destroyed.
     */
    onDestroy: function() {
        ol.Observable.unByKey(this.boundEventKeys);
        this.boundEventKeys = [];
    },

    /**
     * Sets the map resolution to the selected value.
     *
     * @param {BasiGX.view.combo.ScaleCombo} combo The scale combo.
     * @param {Ext.data.Model} rec The selected record.
     */
    onComboSelect: function(combo, rec) {
        this.map.getView().setResolution(rec.get('resolution'));
    },

    /**
     * This method updates the combo with the current maps scale.
     *
     * If the current scale is not available in the scaleStore, it will
     * be created and added. This way we support maps with different scales than
     * the hardwired ones in our scaleStore
     *
     * @param {ol.events.Event} evt The event from the `change:resolution`
     *     event.
     */
    updateComboOnMapChange: function(evt) {
        var mapView = evt.target;
        if (mapView.getAnimating && mapView.getAnimating()) {
            return; // Do not update the combo while we are animating
        }
        var resolution = mapView.get(evt.key); // map.get('resolution')
        var store = this.getStore();

        var matchInStore = (store.findExact('resolution', resolution) >= 0);

        if (!matchInStore) {
            var scale = this.getCurrentScale(resolution);
            var dspScale = '1:' + Math.round(scale).toLocaleString();
            var rec = {
                scale: dspScale,
                resolution: resolution
            };
            store.add(rec);
        }
        this.setValue(resolution);

    },

    /**
     * A little helper method for getting a scale for a given resolution.
     *
     * TODO I think we have this elsewhere as well. We should reuse it probably.
     *
     * @param {Number} resolution The resolution to convert.
     * @return {Number} The calculated scale.
     */
    getCurrentScale: function(resolution) {
        var me = this;
        var units = me.map.getView().getProjection().getUnits();
        var dpi = 25.4 / 0.28;
        var mpu = ol.proj.METERS_PER_UNIT[units];
        var scale = resolution * mpu * 39.37 * dpi;
        return scale;
    }
});
