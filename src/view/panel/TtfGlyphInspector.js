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
 * This class is heavily inspired by the glyph inspector of the opentype.js
 * project. Original resource is http://opentype.js.org/glyph-inspector.html
 * opentype.js is available on https://github.com/nodebox/opentype.js
 * under the MIT License.
 *
 * This Class renders the glyphs of a given ttf-font into a ExtJS Panel
 *
 * @class this
 */
Ext.define('BasiGX.view.panel.TtfGlyphInspector', {
    extend: 'Ext.panel.Panel',
    xtype: 'basigx-panel-ttfglyphinspector',

    /**
     * The initial width of the panel
     */
    width: 500,

    /**
     * The initial height of the panel
     */
    height: 500,

    /**
     * The (blob)-url to a TrueTypeFont to render
     */
    fontSrc: null,

    /**
     * The font family name of the loaded font
     */
    fontFamilyName: null,

    /**
     * The html elements used to render the glyphs
     */
    html:
        '<div>' +
            'Glyphs: <span id="pagination"></span>' +
            '<br>' +
            '<div id="glyph-list-end"></div>' +
        '</div>',

    /**
     * Render specific variables
     */
    cellCount: 100,
    cellWidth: 44,
    cellHeight: 40,
    cellMarginTop: 1,
    cellMarginBottom: 8,
    cellMarginLeftRight: 1,
    pixelRatio: window.devicePixelRatio || 1,
    pageSelected: null,
    font: null,
    fontScale: null,
    fontSize: null,

    /**
     * Method called with an (blob)-url to a ttf font to render.
     * Will create and return an 'Ext.panel.Panel' to show the fonts glyphs.
     */
    initComponent: function() {
        var me = this;
        if (!window.opentype) {
            Ext.log.error('Required global variable "opentype"' +
                ' not found. Is opentype.js loaded?');
            return;
        }

        if (!me.fontSrc) {
            Ext.log.error('Required parameter "fontSrc" not set! ' +
                'Did you pass this parameter?');
            return;
        }

        me.on('afterrender', function() {
            me.enableHighDPICanvas('glyph-bg');
            me.enableHighDPICanvas('glyph');
            me.prepareGlyphList();
            opentype.load(me.fontSrc, function(err, font) {
                if (err) {
                    Ext.log.error('Could not load the given font, ' +
                        'aborting...');
                    return;
                }
                me.onFontLoaded(font);
            });
        });
        me.callParent();
    },

    /**
     * @param {String} canvas The canvas id
     */
    enableHighDPICanvas: function(canvas) {
        if (typeof canvas === 'string') {
            canvas = document.getElementById(canvas);
        }
        if (this.pixelRatio === 1) {
            return;
        }
        var oldWidth = canvas.width;
        var oldHeight = canvas.height;
        canvas.width = oldWidth * this.pixelRatio;
        canvas.height = oldHeight *
            this.pixelRatio;
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        canvas.getContext('2d').scale(
            this.pixelRatio,
            this.pixelRatio
        );
    },

    /**
     * @return {String} unicodestring The formatted UniCode
     * @param {Number} unicode The UniCode describing a specific glyph
     */
    formatUnicode: function(unicode) {
        unicode = unicode.toString(16);
        if (unicode.length > 4) {
            return ('000000' + unicode.toUpperCase()).substr(-6);
        } else {
            return ('0000' + unicode.toUpperCase()).substr(-4);
        }
    },

    /**
     * @param {Object} canvas The canvas Object
     * @param {Number} glyphIndex The index of the glyph
     */
    renderGlyphItem: function(canvas, glyphIndex) {
        var cellMarkSize = 4;
        var ctx = canvas.getContext('2d');
        ctx.clearRect(
            0,
            0,
            this.cellWidth,
            this.cellHeight
        );
        if (glyphIndex >= this.font.numGlyphs) {
            return;
        }

        ctx.fillStyle = '#606060';
        ctx.font = '9px sans-serif';
        ctx.fillText(
            glyphIndex,
            1,
            this.cellHeight - 1
        );
        var glyph = this.font.glyphs.get(
                glyphIndex);
        var glyphWidth = glyph.advanceWidth *
                this.fontScale;
        var xmin = (this.cellWidth - glyphWidth) / 2;
        var xmax = (this.cellWidth + glyphWidth) / 2;
        var x0 = xmin;

        ctx.fillStyle = '#a0a0a0';
        ctx.fillRect(
            xmin - cellMarkSize + 1,
            this.fontSize,
            cellMarkSize,
            1
        );
        ctx.fillRect(
            xmin,
            this.fontSize,
            1,
            cellMarkSize
        );
        ctx.fillRect(
            xmax,
            this.fontSize,
            cellMarkSize,
            1
        );
        ctx.fillRect(
            xmax,
            this.fontSize,
            1,
            cellMarkSize
        );

        ctx.fillStyle = '#000000';
        glyph.draw(
            ctx,
            x0,
            this.fontSize,
            this.fontSize
        );
    },

    /**
     * @param {Number} pageNum The page number.
     */
    displayGlyphPage: function(pageNum) {
        this.pageSelected = pageNum;
        document.getElementById('p' + pageNum).className = 'page-selected';
        var firstGlyph = pageNum * this.cellCount;
        for (var i = 0; i < this.cellCount; i++) {
            this.renderGlyphItem(
                document.getElementById('g' + i), firstGlyph + i
            );
        }
    },

    /**
     * @param {Event} event The event that triggered this function
     */
    pageSelect: function(event) {
        document.getElementsByClassName('page-selected')[0].className = '';
        this.displayGlyphPage(
            +event.target.id.substr(1));
    },

    /**
     * @param {Object} font The font object
     */
    onFontLoaded: function(font) {
        this.font = font;
        // set the family name to the first available name
        this.fontFamilyName = font.names.fontFamily[
            Object.keys(font.names.fontFamily)[0]
        ];

        var w = this.cellWidth -
                this.cellMarginLeftRight * 2;
        var h = this.cellHeight -
                this.cellMarginTop -
                this.cellMarginBottom;
        var head = this.font.tables.head;
        var maxHeight = head.yMax - head.yMin;
        this.fontScale = Math.min(
            w / (head.xMax - head.xMin), h / maxHeight
        );
        this.fontSize =
            this.fontScale *
            this.font.unitsPerEm;
        this.fontSize =
            this.cellMarginTop +
            h * head.yMax / maxHeight;

        var pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        var fragment = document.createDocumentFragment();
        var numPages = Math.ceil(
            this.font.numGlyphs /
            this.cellCount
        );
        for (var i = 0; i < numPages; i++) {
            var link = document.createElement('span');
            var lastIndex = Math.min(
                this.font.numGlyphs - 1,
                (i + 1) * this.cellCount - 1
            );
            link.textContent = i * this.cellCount +
                '-' + lastIndex;
            link.id = 'p' + i;
            link.style.cursor = 'pointer';
            link.style.padding = '0 10px 5px 10px';
            link.style.textDecoration = 'underline';
            link.addEventListener('click',
                this.pageSelect.bind(this), false
            );
            fragment.appendChild(link);
            // A white space allows to break very long lines into multiple
            // lines. This is needed for fonts with thousands of glyphs.
            fragment.appendChild(document.createTextNode(' '));
        }
        pagination.appendChild(fragment);
        this.displayGlyphPage(0);
    },

    /**
     * @param {Event} event The event that triggered this function
     */
    cellSelect: function(event) {
        if (!this.font) {
            return;
        }
        var firstGlyphIndex = this.pageSelected *
                this.cellCount;
        var cellIndex = +event.target.id.substr(1);
        var glyphIndex = firstGlyphIndex + cellIndex;

        if (glyphIndex < this.font.numGlyphs) {
            var glyph = this.font.glyphs.get(
                glyphIndex
            );
            var unicode = this.formatUnicode(
                glyph.unicode
            );
            var fullQualifiedGlypName = 'ttf://' +
                this.fontFamilyName + '#0x' + unicode;
            this.fireEvent('glyphSelected', fullQualifiedGlypName);
        }
    },

    /**
     *
     */
    prepareGlyphList: function() {
        var marker = document.getElementById('glyph-list-end');
        var parent = marker.parentElement;
        for (var i = 0; i < this.cellCount; i++) {
            var canvas = document.createElement('canvas');
            canvas.width = this.cellWidth;
            canvas.height = this.cellHeight;
            canvas.className = 'item';
            canvas.id = 'g' + i;
            canvas.addEventListener('click',
                this.cellSelect.bind(this), false
            );
            this.enableHighDPICanvas(canvas);
            parent.insertBefore(canvas, marker);
        }
    }
});

