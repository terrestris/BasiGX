Ext.data.JsonP.BasiGX_view_form_CoordinateTransform({"tagname":"class","name":"BasiGX.view.form.CoordinateTransform","autodetected":{"aliases":true,"alternateClassNames":true,"extends":true,"mixins":true,"requires":true,"uses":true,"members":true,"code_type":true},"files":[{"filename":"CoordinateTransform.js","href":"CoordinateTransform.html#BasiGX-view-form-CoordinateTransform"}],"aliases":{"widget":["basigx-form-coordinatetransform"]},"alternateClassNames":[],"extends":"Ext.form.Panel","mixins":[],"requires":["BasiGX.util.CopyClipboard","Ext.app.ViewModel","Ext.button.Button"],"uses":[],"members":[{"name":"coordinateSystemsToUse","tagname":"cfg","owner":"BasiGX.view.form.CoordinateTransform","id":"cfg-coordinateSystemsToUse","meta":{}},{"name":"transformCenterOnRender","tagname":"cfg","owner":"BasiGX.view.form.CoordinateTransform","id":"cfg-transformCenterOnRender","meta":{}},{"name":"buttons","tagname":"property","owner":"BasiGX.view.form.CoordinateTransform","id":"property-buttons","meta":{"private":true}},{"name":"layout","tagname":"property","owner":"BasiGX.view.form.CoordinateTransform","id":"property-layout","meta":{"private":true}},{"name":"map","tagname":"property","owner":"BasiGX.view.form.CoordinateTransform","id":"property-map","meta":{}},{"name":"scrollable","tagname":"property","owner":"BasiGX.view.form.CoordinateTransform","id":"property-scrollable","meta":{"private":true}},{"name":"viewModel","tagname":"property","owner":"BasiGX.view.form.CoordinateTransform","id":"property-viewModel","meta":{"private":true}},{"name":"copyCoordinatesToClipboard","tagname":"method","owner":"BasiGX.view.form.CoordinateTransform","id":"method-copyCoordinatesToClipboard","meta":{}},{"name":"getCoordinateSystemsToUse","tagname":"method","owner":"BasiGX.view.form.CoordinateTransform","id":"method-getCoordinateSystemsToUse","meta":{}},{"name":"getTransformCenterOnRender","tagname":"method","owner":"BasiGX.view.form.CoordinateTransform","id":"method-getTransformCenterOnRender","meta":{}},{"name":"initComponent","tagname":"method","owner":"BasiGX.view.form.CoordinateTransform","id":"method-initComponent","meta":{}},{"name":"onCoordinateValueChange","tagname":"method","owner":"BasiGX.view.form.CoordinateTransform","id":"method-onCoordinateValueChange","meta":{}},{"name":"setCoordinateSystemsToUse","tagname":"method","owner":"BasiGX.view.form.CoordinateTransform","id":"method-setCoordinateSystemsToUse","meta":{}},{"name":"setTransformCenterOnRender","tagname":"method","owner":"BasiGX.view.form.CoordinateTransform","id":"method-setTransformCenterOnRender","meta":{}},{"name":"toggleBtnVisibility","tagname":"method","owner":"BasiGX.view.form.CoordinateTransform","id":"method-toggleBtnVisibility","meta":{}},{"name":"transform","tagname":"method","owner":"BasiGX.view.form.CoordinateTransform","id":"method-transform","meta":{}},{"name":"transformCoords","tagname":"method","owner":"BasiGX.view.form.CoordinateTransform","id":"method-transformCoords","meta":{}}],"code_type":"ext_define","id":"class-BasiGX.view.form.CoordinateTransform","component":false,"superclasses":["Ext.form.Panel"],"subclasses":[],"mixedInto":[],"parentMixins":[],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'>Ext.form.Panel<div class='subclass '><strong>BasiGX.view.form.CoordinateTransform</strong></div></div><h4>Requires</h4><div class='dependency'><a href='#!/api/BasiGX.util.CopyClipboard' rel='BasiGX.util.CopyClipboard' class='docClass'>BasiGX.util.CopyClipboard</a></div><div class='dependency'>Ext.app.ViewModel</div><div class='dependency'>Ext.button.Button</div><h4>Files</h4><div class='dependency'><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform' target='_blank'>CoordinateTransform.js</a></div></pre><div class='doc-contents'><p>CoordinateTransform FormPanel</p>\n\n<p>Used to show and transform coordinates</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-coordinateSystemsToUse' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-cfg-coordinateSystemsToUse' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-cfg-coordinateSystemsToUse' class='name expandable'>coordinateSystemsToUse</a> : Array<span class=\"signature\"></span></div><div class='description'><div class='short'>Array of Objects containing code in EPSG notation and Name to display\nthat should be used:\n{code: 'EPSG:4326', name: ...</div><div class='long'><p>Array of Objects containing code in EPSG notation and Name to display\nthat should be used:\n{code: 'EPSG:4326', name: 'WGS84'}</p>\n<p>Defaults to: <code>[]</code></p></div></div></div><div id='cfg-transformCenterOnRender' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-cfg-transformCenterOnRender' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-cfg-transformCenterOnRender' class='name expandable'>transformCenterOnRender</a> : Boolean<span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>true</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-buttons' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-property-buttons' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-property-buttons' class='name expandable'>buttons</a> : Object<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>\n</div><div class='long'>\n</div></div></div><div id='property-layout' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-property-layout' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-property-layout' class='name expandable'>layout</a> : String<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;form&#39;</code></p></div></div></div><div id='property-map' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-property-map' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-property-map' class='name expandable'>map</a> : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>\n</div><div class='long'>\n</div></div></div><div id='property-scrollable' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-property-scrollable' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-property-scrollable' class='name expandable'>scrollable</a> : String<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;y&#39;</code></p></div></div></div><div id='property-viewModel' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-property-viewModel' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-property-viewModel' class='name expandable'>viewModel</a> : Object<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>{data: {coordFieldSetTitle: &#39;Koordinaten&#39;, coordXFieldLabel: &#39;X-Koordinate&#39;, coordYFieldLabel: &#39;Y-Koordinate&#39;, transformBtnText: &#39;Transformieren&#39;, resetFormBtnText: &#39;Zurücksetzen&#39;, transformBtnToolTip: &#39;Transformieren&#39;, copyToClipboardBtnText: &#39;In Zwischenablage kopieren&#39;, copyToClipboardButtonToolTip: &#39;In Zwischenablage kopieren&#39;, documentation: &#39;&lt;h2&gt;Koordinaten transformieren&lt;/h2&gt;• In diesem &#39; + &#39;Dialog können Koordinaten transformiert werden.&lt;br&gt;&#39; + &#39;• Geben Sie Koordinaten in die Eingabefelder ein, um sich &#39; + &#39;anschließend den Punkt in der Karte anzeigen zu lassen.&lt;br&gt;&#39; + &#39;• Klicken Sie alternativ in die Karte, um sich die &#39; + &#39;jeweiligen Koordinaten anzeigen zu lassen&#39;}}</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-copyCoordinatesToClipboard' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-method-copyCoordinatesToClipboard' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-method-copyCoordinatesToClipboard' class='name expandable'>copyCoordinatesToClipboard</a>( <span class='pre'>btn</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Copies displayed coordinates to the clipboard. ...</div><div class='long'><p>Copies displayed coordinates to the clipboard.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>btn</span> : Ext.button.Button<div class='sub-desc'><p>The clicked copy button</p>\n</div></li></ul></div></div></div><div id='method-getCoordinateSystemsToUse' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-cfg-coordinateSystemsToUse' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-method-getCoordinateSystemsToUse' class='name expandable'>getCoordinateSystemsToUse</a>( <span class='pre'></span> ) : Array<span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of coordinateSystemsToUse. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/BasiGX.view.form.CoordinateTransform-cfg-coordinateSystemsToUse\" rel=\"BasiGX.view.form.CoordinateTransform-cfg-coordinateSystemsToUse\" class=\"docClass\">coordinateSystemsToUse</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>Array</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getTransformCenterOnRender' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-cfg-transformCenterOnRender' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-method-getTransformCenterOnRender' class='name expandable'>getTransformCenterOnRender</a>( <span class='pre'></span> ) : Boolean<span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of transformCenterOnRender. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/BasiGX.view.form.CoordinateTransform-cfg-transformCenterOnRender\" rel=\"BasiGX.view.form.CoordinateTransform-cfg-transformCenterOnRender\" class=\"docClass\">transformCenterOnRender</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>Boolean</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-initComponent' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-method-initComponent' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-method-initComponent' class='name expandable'>initComponent</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n</div></div></div><div id='method-onCoordinateValueChange' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-method-onCoordinateValueChange' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-method-onCoordinateValueChange' class='name expandable'>onCoordinateValueChange</a>( <span class='pre'>numberField, newValue</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Toggles disabled state of fieldset buttons depending on provided field\nvalue. ...</div><div class='long'><p>Toggles disabled state of fieldset buttons depending on provided field\nvalue.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>numberField</span> : Ext.form.field.Number<div class='sub-desc'><p>Coordinate field</p>\n</div></li><li><span class='pre'>newValue</span> : Number|null<div class='sub-desc'><p>Current coordinate value</p>\n</div></li></ul></div></div></div><div id='method-setCoordinateSystemsToUse' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-cfg-coordinateSystemsToUse' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-method-setCoordinateSystemsToUse' class='name expandable'>setCoordinateSystemsToUse</a>( <span class='pre'>coordinateSystemsToUse</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of coordinateSystemsToUse. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/BasiGX.view.form.CoordinateTransform-cfg-coordinateSystemsToUse\" rel=\"BasiGX.view.form.CoordinateTransform-cfg-coordinateSystemsToUse\" class=\"docClass\">coordinateSystemsToUse</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>coordinateSystemsToUse</span> : Array<div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-setTransformCenterOnRender' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-cfg-transformCenterOnRender' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-method-setTransformCenterOnRender' class='name expandable'>setTransformCenterOnRender</a>( <span class='pre'>transformCenterOnRender</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of transformCenterOnRender. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/BasiGX.view.form.CoordinateTransform-cfg-transformCenterOnRender\" rel=\"BasiGX.view.form.CoordinateTransform-cfg-transformCenterOnRender\" class=\"docClass\">transformCenterOnRender</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>transformCenterOnRender</span> : Boolean<div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-toggleBtnVisibility' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-method-toggleBtnVisibility' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-method-toggleBtnVisibility' class='name expandable'>toggleBtnVisibility</a>( <span class='pre'>field</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Bound to the focus event of the textfields, this handler ensures that\nonly the correct (associated) transform button ...</div><div class='long'><p>Bound to the focus event of the textfields, this handler ensures that\nonly the correct (associated) transform button is visible.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>field</span> : Ext.form.fiel.Text<div class='sub-desc'><p>The textfield.</p>\n</div></li></ul></div></div></div><div id='method-transform' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-method-transform' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-method-transform' class='name expandable'>transform</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'></span> : ol.MapBrowserEvent|ol.Coordinate|Ext.button.Button<div class='sub-desc'><p>evtOrBtnOrArray The input to transfrom, works with different types.</p>\n</div></li></ul></div></div></div><div id='method-transformCoords' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='BasiGX.view.form.CoordinateTransform'>BasiGX.view.form.CoordinateTransform</span><br/><a href='source/CoordinateTransform.html#BasiGX-view-form-CoordinateTransform-method-transformCoords' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BasiGX.view.form.CoordinateTransform-method-transformCoords' class='name expandable'>transformCoords</a>( <span class='pre'>coordToTransform, mapProjection, targetCrs</span> ) : ol.Coordinate<span class=\"signature\"></span></div><div class='description'><div class='short'>Transforms the passed coordinates from mapProjection to targetCrs\nrounds according to the units of the targetCrs. ...</div><div class='long'><p>Transforms the passed coordinates from <code>mapProjection</code> to <code>targetCrs</code>\nrounds according to the units of the <code>targetCrs</code>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>coordToTransform</span> : ol.Coordinate<div class='sub-desc'><p>The coordinates to transform.</p>\n</div></li><li><span class='pre'>mapProjection</span> : ol.proj.Projection<div class='sub-desc'><p>The source projection.</p>\n</div></li><li><span class='pre'>targetCrs</span> : ol.proj.Projection<div class='sub-desc'><p>The target projection.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>ol.Coordinate</span><div class='sub-desc'><p>The transformed and formatted coordinates.</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});