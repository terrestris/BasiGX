/*global document*/
// This file is taken from GeoExt3
(function(doc, global) {
    var specPath = './spec/';
    var dependencies = [
        'basics.test.js',
        'plugin/AccessibleTitle.test.js',
        'plugin/Hover.test.js',
        'plugin/WfsCluster.test.js',
        'util/Accessibility.test.js',
        'util/Animate.test.js',
        'util/Application.test.js',
        'util/Caching.test.js',
        'util/Color.test.js',
        'util/ConfigParser.test.js',
        'util/Controller.test.js',
        'util/CopyClipboard.test.js',
        'util/CSRF.test.js',
        'util/Layer.test.js',
        'util/Map.test.js',
        'util/Object.test.js',
        'util/SLD.test.js',
        'util/Url.test.js',
        'util/WFS.test.js',
        'ux/ContextSensitiveHelp.test.js',
        'ux/RowExpanderWithComponents.test.js',
        'view/button/AddWms.test.js',
        'view/button/Base.test.js',
        'view/button/CoordinateTransform.test.js',
        'view/button/Help.test.js',
        'view/button/Hsi.test.js',
        'view/button/Measure.test.js',
        'view/button/Permalink.test.js',
        'view/button/SpatialOperatorUnion.test.js',
        'view/button/SpatialOperatorDifference.test.js',
        'view/button/SpatialOperatorIntersect.test.js',
        'view/button/ToggleLegend.test.js',
        'view/button/ZoomIn.test.js',
        'view/button/ZoomOut.test.js',
        'view/button/ZoomToExtent.test.js',
        'view/combo/Language.test.js',
        'view/combo/ScaleCombo.test.js',
        'view/component/Map.test.js',
        'view/container/LayerSlider.test.js',
        'view/container/NominatimSearch.test.js',
        'view/container/OverpassSearch.test.js',
        'view/container/Redlining.test.js',
        'view/container/SLDStyler.test.js',
        'view/container/WfsSearch.test.js',
        'view/form/field/GazetteerCombo.test.js',
        'view/form/AddWms.test.js',
        'view/form/CoordinateTransform.test.js',
        'view/form/CsvImport.test.js',
        'view/form/Permalink.test.js',
        'view/form/Print.test.js',
        'view/grid/FeaturePropertyGrid.test.js',
        'view/grid/GazetteerGrid.test.js',
        'view/list/FocusableTreeItem.test.js',
        'view/panel/Accessible.test.js',
        'view/panel/Header.test.js',
        'view/panel/LayerSetChooser.test.js',
        'view/panel/LegendTree.test.js',
        'view/panel/MapContainer.test.js',
        'view/panel/Menu.test.js',
        'view/view/LayerSet.test.js',
        'view/window/Accessible.test.js'
    ];
    var getScriptTag = global.TestUtil.getExternalScriptTag;
    var dependencyCnt = dependencies.length;
    var i = 0;
    for (; i < dependencyCnt; i++) {
        doc.write(getScriptTag(specPath + dependencies[i]));
    }
}(document, this));
