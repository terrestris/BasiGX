/*global FileReader*/
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
 * HTML 5 - CSV Importer
 *
 * This form is used to import csv files to an Ext-JS Grid. As it uses the HTML5
 * File-Api InternetExplorer < 10 is not supported.
 *
 * Current CSV Requirements:
 *      First Row contains headers.
 *      Seperator is comma.
 *      Strings are in doublequotes.
 *
 */
Ext.define("BasiGX.view.form.CsvImport",{
    extend: "Ext.form.Panel",

    xtype: "form-csvimport",

    config: {
        grid: null,
        dataArray: null
    },

    initComponent: function(conf){
        var me = this;
        me.callParent(conf);

        if(!me.getGrid()){
            Ext.Error.raise('No grid defined for csv-importer.');
        }
    },

    /**
     * You can put default associations here. These will fill the comboboxes.
     *
     * The key represents the csv-column.
     * The value represents the Grid column text.
     *
     * associatonObject: {
     *     Name: "Nachname",
     *     Vorname: "Vorname",
     *     Straße: null,
     *     Hausnummer: null,
           Postleitzahl: null,
     *     Stadt: null,
     *     "E-Mail_1": "E-Mail",
     *     "E-Mail_2": null
     *},
     */
    associatonObject: {

    },

    bodyPadding: 10,

    items: [{
        xtype: 'filefield',
        name: 'csv_file',
        fieldLabel: 'CSV-Datei',
        labelWidth: 70,
        width: 400,
        msgTarget: 'side',
        allowBlank: false,
        buttonText: 'Datei auswähen …',
        validator: function(val) {
            var fileName = /^.*\.(csv)$/i;
            var errMsg = 'Der Datenimport ist nur mit CSV-Dateien möglich.';
            return fileName.test(val) || errMsg;
      }
    }],

    buttons: [{
        xtype: "button",
        name: "importBtn",
        text: "Importieren",
        handler: function(btn){
            var me = this.up('form');
            me.startImport(btn);
        },
        disabled: true
    },{
        text: 'Datei einlesen',
        handler: function() {
            if (window.FileReader) {
                var me = this.up('form');
                var fileField = me.down('filefield');
                var file = fileField.extractFileInput().files[0];
                var reader = new FileReader();

                reader.readAsText(file);
                reader.onload = me.onLoad;
                reader.onerror = me.onError;
            } else {
                Ext.Toast('FileReader are not supported in this browser.');
            }
        }
    }],

    onLoad: function(event) {
        var me = Ext.ComponentQuery.query('form-csvimport')[0];
        var csv = event.target.result;
        var dataArray = Ext.util.CSV.decode(csv);
        me.setDataArray(dataArray);

        me.setupAssociations(dataArray[0], me);

    },

    onError: function(evt) {
        if(evt.target.error.name === "NotReadableError") {
            Ext.toast("Canno't read file !");
        }
    },

    setupAssociations: function(titleRow, me){
        var dataModelColumns = me.getGrid().query('gridcolumn[hidden=false]');
        var columnTitles = [];
        var assoFieldset = Ext.create("Ext.form.FieldSet", {
            title: "Felder asozieren",
            name: "assoFieldset",
            layout: "form",
            scrollable: "y",
            maxHeight: 300,
            collapsible: true,
            margin: "0 0 30 0"
        });

        Ext.each(dataModelColumns, function(column){
            columnTitles.push(column.text);
        }, me);

        Ext.each(titleRow, function(columnName){
            assoFieldset.add({
                xtype: "combobox",
                name: columnName,
                fieldLabel: columnName,
                store: columnTitles,
                value: me.associatonObject[columnName],
                msgTarget: "side"
            });
        }, me);

        me.down('button[name=importBtn]').enable();

        me.add(assoFieldset);
    },

    addToGrid: function(dataArray){
        var me = this;
        var store = me.getGrid().getStore();

        me.setLoading(true);
        Ext.each(dataArray, function(dataRow, index){
            if(index > 0){ //skip first row of csv. it contains the header
                var instance = this.parseDataFromRow(dataRow);
                store.add(instance);
            }
        }, me);
        me.setLoading(false);
    },

    parseDataFromRow: function(dataRow){
        var me = this;
        var data = {};

        Ext.each(dataRow, function(csvColumn, rowIdx){
            var gridColumText = me.associatonObject[
                me.getDataArray()[0][rowIdx]];
            if(!Ext.isEmpty(csvColumn) && !Ext.isEmpty(gridColumText)){
                var gridColumn = me.getGrid()
                    .down('gridcolumn[text='+gridColumText+']');
                if(gridColumn){
                    var dataIndex = gridColumn.dataIndex;
                    data[dataIndex] = csvColumn;
                } else {
                    Ext.Error.raise(gridColumText,
                        ' does not exist. Please check you associationObject.');
                }
            }
        });

        return Ext.create(this.getGrid().getStore().getModel(), data);
    },

    startImport: function(btn){
        var me = this;
        var combos = btn.up('form').down('fieldset[name=assoFieldset]').
            query('combo');
        var comboValues = [];
        var formValid = true;

        Ext.each(combos, function(combo){
            var comboVal = combo.getValue();
            if(Ext.Array.contains(comboValues, comboVal) &&
                !Ext.isEmpty(comboVal)){
                combo.markInvalid("Diese Feld wurde bereits mit einer anderen" +
                    "Spalte asoziert");
                formValid = false;
            } else {
                this.associatonObject[combo.getFieldLabel()] = comboVal;
            }
            comboValues.push(comboVal);
        }, me);

        if(formValid && me.getDataArray()){
            me.addToGrid(me.getDataArray());
        }

        me.fireEvent('importcomplete', me);
    }
});
