/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 */
Ext.define("BasiGX.view.combo.ScaleCombo", {
    xtype: "basigx-combo-scale",
    extend: 'Ext.form.field.ComboBox',
    requires: [
    ],

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
     *
     */
    fieldLabel: '',

    /**
     *
     */
    map: null,

    config: {
        /**
         *
         */
        scales: [
                 {"scale": "1:2.000.000", "resolution": 560},
                 {"scale": "1:1.000.000", "resolution": 280},
                 {"scale": "1:500.000", "resolution": 140},
                 {"scale": "1:250.000", "resolution": 70},
                 {"scale": "1:100.000", "resolution": 28},
                 {"scale": "1:50.000", "resolution": 14},
                 {"scale": "1:25.000", "resolution": 7},
                 {"scale": "1:10.000", "resolution": 2.8},
                 {"scale": "1:5.000", "resolution": 1.4},
                 {"scale": "1:2.500", "resolution": 0.7},
                 {"scale": "1:1.000", "resolution": 0.28},
                 {"scale": "1:500", "resolution": 0.14}
             ]
    },

    /**
     *
     */
    initComponent: function(){
        var me = this;

        if (!me.map) {
            me.map = Ext.ComponentQuery.query("gx_map")[0].getMap();
        }


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

        me.callParent([arguments]);

        // set the correct default value
        me.setValue(me.map.getView().getResolution());

        // register listeners to update combo and map
        me.on('select', function(combo, rec) {
            me.map.getView().setResolution(rec.get('resolution'));
        });
        me.map.getView().on('change:resolution', me.updateComboOnMapChange, me);
    },

    /**
     * Method updates the combo with the current maps scale
     * If the current scale is not available in the scaleStore, it will
     * be created and added. This way we support maps with different scales than
     * the hard ones in our scaleStore
     */
    updateComboOnMapChange: function(evt) {
       var resolution = evt.target.get(evt.key),
           store = this.getStore(),
           matchInStore = false;

       matchInStore = (store.findExact("resolution", resolution) >= 0) ?
           true : false;

       if (matchInStore) {
           this.setValue(resolution);
       } else {
           var rec = {
               scale: '1:' + Math.round(
                   this.getCurrentScale(resolution)).toLocaleString(),
               resolution: resolution
           };
           store.add(rec);
           this.setValue(resolution);
       }

    },

    /**
     * a little getScale helper
     */
    getCurrentScale: function (resolution) {
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap(),
            units = map.getView().getProjection().getUnits(),
            dpi = 25.4 / 0.28,
            mpu = ol.proj.METERS_PER_UNIT[units],
            scale = resolution * mpu * 39.37 * dpi;
        return scale;
    }
});
