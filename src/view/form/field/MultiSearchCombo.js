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
 *
 * Multisearch combo used to search in the glorious dataset of OSM combined
 * with a WFS search searching through configurable layers. This class calls
 * `BasiGX.view.container.MultiSearchSettings` to configure settings and
 * `BasiGX.view.grid.MultiSearchWFSSearchGrid` as well as
 * `BasiGX.view.grid.MultiSearchGazetteerGrid` to show search results.
 *
 * This component assumes the use of only one `BasiGX.util.Map`; we use
 * `BasiGX.util.Map.getMapComponent().getMap()`.
 *
 *     {
 *         xtype: 'basigx-form-field-multisearch',
 *         config: {
 *             wfsServerUrl: "yourdomain/geoserver/ows?",
 *             searchLayerBlackList: [
 *                 "your-favorite-background-layer"
 *             ]
 *         }
 *     }
 *
 * @class BasiGX.view.form.field.MultiSearchCombo
 *
 * @extends Ext.form.field.ComboBox
 *
 * @requires BasiGX.util.Map
 * @requires BasiGX.view.container.MultiSearchSettings
 * @requires BasiGX.view.grid.MultiSearchWFSSearchGrid
 * @requires BasiGX.view.grid.MultiSearchGazetteerGrid
 *
 */
Ext.define('BasiGX.view.form.field.MultiSearchCombo', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'basigx-form-field-multisearch',

    requires: [
        'BasiGX.util.Map',
        'BasiGX.view.container.MultiSearchSettings',
        'BasiGX.view.grid.MultiSearchWFSSearchGrid',
        'BasiGX.view.grid.MultiSearchGazetteerGrid'
    ],

    viewModel: {
        data: {
            emptyText: 'Suche ...',
            settingsWindowTitle: 'Sucheinstellungen',
            noResultsFoundText: 'Keine Ergebnisse gefunden'
        }
    },

    config: {

        gazetteerGrid: 'basigx-grid-multisearchgazetteergrid',

        wfsSearchGrid: 'basigx-grid-multisearchwfssearchgrid',

        searchSettings: 'basigx-container-multisearchsettings',

        wfsServerUrl: null,

        wfsPrefix: null,

        wfsDataProjection: null,

        wfsFeatureProjection: null,

        gazetteerSearch: true,

        wfsSearch: true,

        limitToBBox: true,

        allSearchLayers: [],

        configuredSearchLayers: [],

        searchLayerBlackList: [],

        /**
         * Whether to use custom geoserver filter function `stringFormat` which
         * isn't officially contained in geoserver filter functions list.
         *
         * Geoserver cannot handle LIKE queries on numeric fields out of the
         * box. For manually converting to string e.g. `strTrim` filter function
         * can be used though. In some cases double values will be possibly
         * converted to scientific notation, what makes LIKE queries useless.
         *
         * Example:
         * * string representation of `2375239000 is `2.375239e+9`
         * * string representation of `2391101900 is `2.3911019e+9`
         * Query like `attrName ILIKE "%239%" will return only the first match.
         *
         * If set to true, the additional geoserver extension
         *`terrestris-filterfunctions` must be installed (see
         * https://github.com/terrestris/terrestris-filterfunctions
         * for further details)
         */
        useGeoServerStringExtension: false,

        /**
         * Maximum number of features to retrieve from WFS search.
         */
        maxFeatures: 10,

        /**
         * Delay in ms before query avoid search triggering while typing
         */
        typeDelay: 500
    },

    store: [],

    searchContainer: null,

    settingsWindow: null,

    /**
     * Member to check if some gazetteer results were retrieved for the searched
     * term. If neither gazetteer nor wfs results are returned "No results
     * found" message will be shown as callback.
     */
    noGazetteerResults: false,

    /**
     * Member to check if some wfs results were retrieved for the searched term
     * term. If neither gazetteer nor wfs results are returned "No results
     * found" message will be shown as callback.
     */
    noWfsSearchResults: false,

    minChars: 0,

    /**
     * Member for the delayed task to buffer search execution within specified
     * time period provided via `typeDelay` config
     */
    typeDelayTask: null,

    bind: {
        emptyText: '{emptyText}'
    },

    triggerCls: 'default-trigger',

    triggers: {
        refresh: {
            cls: 'multisearch-refresh-trigger',
            handler: function() {
                this.refreshSearchResults();
            }
        },
        settings: {
            cls: 'multisearch-settings-trigger',
            handler: function() {
                this.showSettingsWindow();
            }
        },
        close: {
            cls: 'multisearch-open-container-trigger',
            handler: function(combo) {
                this.changeContainerVisibility(combo);
            }
        }
    },

    /**
     * Called by the close trigger, changes visibility of search results
     * container.
     * @param {BasiGX.view.form.field.MultiSearchCombo} combo Multisearch combo.
     */
    changeContainerVisibility: function(combo) {
        if (combo.searchContainer) {
            if (combo.searchContainer.isVisible()) {
                combo.cleanupSearch();
            } else {
                combo.refreshSearchResults();
            }
        }
    },

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        me.setHideTrigger(false);

        // get all layers from the map except the blacklisted ones
        var map = BasiGX.util.Map.getMapComponent().getMap();
        var allLayers = BasiGX.util.Layer.getAllLayers(map);
        var blackList = me.getSearchLayerBlackList();

        Ext.each(allLayers, function(l) {
            if (l instanceof ol.layer.Tile && !Ext.Array.contains(blackList,
                l.get('name'))) {
                me.allSearchLayers.push(l);
            }
        });

        // set search layers to all above layers if not configured different
        if (me.getConfiguredSearchLayers().length === 0) {
            Ext.each(me.getAllSearchLayers(), function(l) {
                me.configuredSearchLayers.push(l);
            });
        }

        me.on('boxready', me.onBoxReady, me);
        me.on('change', me.onComboValueChange, me);

    },

    /**
     * Ensures that the value is cleared when one hits escape.
     */
    onBoxReady: function() {
        var me = this;
        me.nav = Ext.create('Ext.util.KeyNav', me.el, {
            esc: me.clearValue,
            scope: me
        });
    },

    /**
     * Called by the onChange listener.
     *
     * When a search term is typed into the combobox, this method will trigger
     * the included searches or fades out.
     *
     * @param {BasiGX.view.form.field.MultiSearchCombo} combo The combo itself.
     * @param {String} newValue The new value that was just typed.
     */
    onComboValueChange: function(combo, newValue) {
        var me = this;

        if (newValue) {
            if (newValue.length >= me.minChars) {

                if (me.typeDelayTask) {
                    me.typeDelayTask.cancel();
                }

                // delay search execution
                me.typeDelayTask = new Ext.util.DelayedTask(function() {
                    // create the multi search panel
                    me.showResults();

                    // start the gazetteer search
                    me.doGazetteerSearch(newValue, me.getLimitToBBox);

                    // start the object search
                    me.doObjectSearch(newValue);
                });
                me.typeDelayTask.delay(me.getTypeDelay());
            } else {
                me.cleanupSearch();
            }
        } else {
            me.cleanupSearch();
        }
    },

    /**
     * Cleanup result vector layer and hide search container
     */
    cleanupSearch: function() {
        var me = this;
        var wfsGrid = me.getWfsSearchGrid();
        var objectSearchGrid = Ext.ComponentQuery.query(wfsGrid)[0];

        if (!objectSearchGrid) {
            return;
        }

        var searchLayer = objectSearchGrid.searchResultVectorLayer;

        if (searchLayer) {
            searchLayer.getSource().clear();
        }

        var closeTrigger = me.triggers.close;
        if (closeTrigger) {
            var openCls = 'multisearch-open-container-trigger';
            var closeCls = 'multisearch-close-container-trigger';
            closeTrigger.el.removeCls(closeCls).addCls(openCls);
        }

        if (me.searchContainer) {
            me.searchContainer.getEl().slideOut('t', {
                duration: 250,
                callback: function() {
                    me.searchContainer.hide();
                },
                scope: me.searchContainer
            });
        }
    },

    /**
     * Called by onComboValueChange() to start the gazetteer search.
     * This method also handles inactive status if configured before.
     *
     * @param {string} value The typed search term of the user
     * @param {boolean} limitToBBox Search is limited to visible extent
     */
    doGazetteerSearch: function(value, limitToBBox) {
        var me = this;
        var gazetteerGrid =
            Ext.ComponentQuery.query(me.getGazetteerGrid())[0];

        if (gazetteerGrid) {
            if (me.getGazetteerSearch()) {
                gazetteerGrid.doGazetteerSearch(value, limitToBBox);
                gazetteerGrid.getStore().on('load', function(store) {
                    if (store.getData().items.length > 0) {
                        gazetteerGrid.show();
                        gazetteerGrid.expand();
                        me.noGazetteerResults = false;
                    } else {
                        gazetteerGrid.hide();
                        me.noGazetteerResults = true;
                    }
                    me.fireEvent('checkresultsvisibility');
                }, me, {single: true});
            } else {
                me.noGazetteerResults = true;
                gazetteerGrid.hide();
                gazetteerGrid.getStore().removeAll();
            }
        } else {
            Ext.log.error('Gazetteer SearchGrid not found');
        }
    },

    /**
     * Called by onComboValueChange() to start the object search.
     * This method also handles inactive status if configured before.
     *
     * @param {string} value The typed search term of the user
     */
    doObjectSearch: function(value) {

        var me = this;

        var objectSearchGrid =
            Ext.ComponentQuery.query(me.getWfsSearchGrid())[0];

        if (objectSearchGrid) {
            if (me.getWfsSearch()) {
                objectSearchGrid.describeFeatureTypes(value, me);
                objectSearchGrid.expand();
            } else {
                objectSearchGrid.hide();
                me.noWfsSearchResults = true;
                objectSearchGrid.getStore().removeAll();
            }
        } else {
            Ext.log.error('ObjectSearchGrid not found');
        }

    },

    /**
     * Called by onComboValueChange() to build a container with the gazetteer
     * grid and the object search grid containing all search results.
     * This method builds the container at the bottom of the searchfield.
     */
    showResults: function() {
        var me = this;
        var parentItem;
        var parentRegion;
        var position;
        var searchContainer;

        if (!me.searchContainer) {

            parentItem = me.getEl();
            parentRegion = parentItem.getClientRegion();

            position = {
                top: parentRegion.bottom + 'px',
                left: parentRegion.left + 'px',
                width: parentItem.getWidth() + 'px'
            };

            searchContainer = Ext.create(Ext.container.Container, {
                renderTo: Ext.getBody(),
                name: 'search-results-container',
                items: [
                    {
                        xtype: me.getGazetteerGrid()
                    }, {
                        xtype: me.getWfsSearchGrid()
                    }, {
                        xtype: 'panel',
                        name: 'noresults',
                        bodyPadding: 10,
                        hidden: true,
                        html: me.getViewModel().get('noResultsFoundText')
                    }
                ],
                width: position.width,
                style: {
                    top: position.top,
                    left: position.left,
                    zIndex: 10
                }
            });
            me.searchContainer = searchContainer;
            me.on('checkresultsvisibility', function() {
                var hidden = me.noGazetteerResults && me.noWfsSearchResults;
                var selector = 'panel[name=noresults]';
                me.searchContainer.down(selector).setVisible(hidden);
            }, me);
        }
        me.searchContainer.show();

        var closeTrigger = me.triggers.close;
        if (closeTrigger) {
            var openCls = 'multisearch-open-container-trigger';
            var closeCls = 'multisearch-close-container-trigger';
            closeTrigger.el.removeCls(openCls).addCls(closeCls);
        }
    },

    /**
     * Called by the refresh-trigger to search again.
     */
    refreshSearchResults: function() {
        var me = this;

        var value = me.getValue();


        if (value && value.length >= me.minChars) {
            me.showResults();
            me.doGazetteerSearch(value);
            me.doObjectSearch(value);
        } else {
            Ext.log.error('No value to search for');
        }
    },

    /**
     * Called by the settings-trigger to build a window containing the
     * settings container
     */
    showSettingsWindow: function() {
        var me = this;
        var settingsWindow;

        if (me.settingsWindow) {
            if (me.settingsWindow.hidden) {
                me.settingsWindow.show();
            } else {
                BasiGX.util.Animate.shake(me.settingsWindow);
            }
        } else {
            settingsWindow = Ext.create('Ext.window.Window', {
                items: [{
                    xtype: me.getSearchSettings(),
                    combo: me
                }],
                title: me.getViewModel().get('settingsWindowTitle'),
                closeAction: 'hide',
                autoShow: true,
                constrain: true
            });
            me.settingsWindow = settingsWindow;
        }
    }
});
