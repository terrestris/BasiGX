/* Copyright (c) 2022-present terrestris GmbH & Co. KG
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
 * Used to add an ArcGIS REST layer to the map
 *
 * @class BasiGX.view.tree.ArcGISRestServiceTree
 */
Ext.define('BasiGX.view.tree.ArcGISRestServiceTree', {
    extend: 'Ext.tree.Panel',
    xtype: 'basigx-tree-arcgisrestservicetree',

    requires: [
        'GeoExt.data.model.ArcGISRestServiceLayer',
        'BasiGX.util.ArcGISRest',
        'Ext.tree.Column'
    ],

    config: {
        /**
         * Whether we will send the `X-Requested-With` header when fetching the
         * document from the URL. The `X-Requested-With` header is
         * usually added for XHR, but adding it should lead to a preflight
         * request (see https://goo.gl/6JzdUI), which some servers fail.
         *
         * @type {Boolean}
         */
        useDefaultXhrHeader: false
    },

    arcGISLayerConfig: null,


    listeners: {
        itemclick: function(view, record){
            // toggle visibility of sublayer
            var currentVisibility = record.get('visibility');
            record.set('visibility', !currentVisibility);
        },
        beforecheckchange: function(node, checked){
            // when layer is not checked anymore it will be collapsed
            if (checked) {
                node.collapse();
            }
        }
    },

    columns: {
        header: false,
        items: [{
            xtype: 'treecolumn',
            renderer: function(v, metaData, record) {
                if (!record.isRoot()) {
                    var eyeGlyph = 'xf06e@FontAwesome';
                    var eyeSlashGlyph = 'xf070@FontAwesome';
                    if (record.get('visibility')) {
                        metaData.glyph = eyeGlyph;
                    } else {
                        metaData.glyph = eyeSlashGlyph;
                    }
                }
                return record.get('name');
            }
        }],
        defaults: {
            flex: 1
        }
    },

    initComponent: function() {
        var me = this;
        me.callParent();

        var rootLabel = me.arcGISLayerConfig.service.name;
        if (me.arcGISLayerConfig.service.type === 'FeatureServer') {
            rootLabel += '/' + me.arcGISLayerConfig.layer.name;
        }

        me.setStore({
            model: 'GeoExt.data.model.ArcGISRestServiceLayer',
            root: {
                name: rootLabel,
                checked: true,
                children: []
            },
            listeners: {
                'nodeexpand': me.onNodeExpand.bind(me)
            }
        });
    },

    onNodeExpand: function(expandedNode) {
        var me = this;

        // ensure expanded layer is always checked
        expandedNode.set('checked', true);

        if (expandedNode.hasChildNodes()) {
            return;
        }

        me.fireEvent('arcgisrestservicetreenodeexpand', expandedNode);
    }

});
