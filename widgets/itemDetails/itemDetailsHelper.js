﻿/*global dojo,define,document */
/*jslint sloppy:true */
/** @license
| Version 10.2
| Copyright 2013 Esri
|
| Licensed under the Apache License, Version 2.0 (the "License");
| you may not use this file except in compliance with the License.
| You may obtain a copy of the License at
|
|    http://www.apache.org/licenses/LICENSE-2.0
|
| Unless required by applicable law or agreed to in writing, software
| distributed under the License is distributed on an "AS IS" BASIS,
| WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
| See the License for the specific language governing permissions and
| limitations under the License.
*/
//============================================================================================================================//
define([
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-attr",
        "dojo/dom",
        "dojo/text!./templates/itemDetails.html",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/i18n!nls/localizedStrings",
        "dojo/query",
        "dojo/dom-class",
        "dojo/on",
        "dojo/Deferred",
        "dojo/number",
        "dojo/topic",
        "esri/map",
        "esri/tasks/locator",
        "dojo/string",
        "esri/layers/GraphicsLayer",
        "dojo/dom-style",
        "dojo/dom-geometry"
    ],
    function (declare, domConstruct, lang, array, domAttr, dom, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, nls, query, domClass, on, Deferred, number, topic, esriMap, Locator, string, GraphicsLayer, domStyle, domGeom) {
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            basemapLayer: null,
            lastSearchString: null,
            stagedSearch: null,
            mapPoint: null,
            map: null,
            tempGraphicsLayerId: "esriGraphicsLayerMapSettings",

            attachLocatorEvents: function () {
                domStyle.set(this.hideMapText, "display", "none");
                this.own(on(this.addressSearchIcon, "click", lang.hitch(this, function () {
                    domStyle.set(this.hideMapText, "display", "none");
                    if (lang.trim(this.txtAddressSearch.value) != '') {
                        this._locateAddress();
                    }
                })));
                this.own(on(this.txtAddressSearch, "keyup", lang.hitch(this, function (evt) {
                    domStyle.set(this.hideMapText, "display", "block");
                    this._submitAddress(evt);
                })));
                this.own(on(this.txtAddressSearch, "dblclick", lang.hitch(this, function (evt) {
                    topic.publish("clearDefaultText", evt);
                })));
                this.own(on(this.txtAddressSearch, "focus", lang.hitch(this, function () {
                    if (this.txtAddressSearch.value == '') {
                        domStyle.set(this.hideMapText, "display", "none");
                    } else {
                        domStyle.set(this.hideMapText, "display", "block");
                    }
                    domClass.add(this.txtAddressSearch, "esriCTColorChange");
                })));
                this.own(on(this.hideMapText, "click", lang.hitch(this, function (evt) {
                    this.txtAddressSearch.value = '';
                    domAttr.set(this.txtAddressSearch, "defaultAddress", this.txtAddressSearch.value);
                    if (domGeom.position(this.autocompleteResults).h > 0) {
                        domClass.replace(this.autocompleteResults, "displayNoneAll", "displayBlockAll");
                    }
                })));
            },

            _submitAddress: function (evt) {
                if (evt) {
                    if (evt.keyCode == dojo.keys.ENTER) {
                        if (lang.trim(this.txtAddressSearch.value) != '') {
                            this._locateAddress(evt);
                            return;
                        }
                    }

                    /**
                    * do not perform auto complete search if alphabets,
                    * numbers,numpad keys,comma,ctl+v,ctrl +x,delete or
                    * backspace is pressed
                    */
                    if ((!((evt.keyCode >= 46 && evt.keyCode < 58) || (evt.keyCode > 64 && evt.keyCode < 91) || (evt.keyCode > 95 && evt.keyCode < 106) || evt.keyCode == 8 || evt.keyCode == 110 || evt.keyCode == 188)) || (evt.keyCode == 86 && evt.ctrlKey) || (evt.keyCode == 88 && evt.ctrlKey)) {
                        evt.cancelBubble = true;
                        evt.stopPropagation && evt.stopPropagation();
                        return;
                    }

                    /**
                    * call locator service if search text is not empty
                    */
                    if (lang.trim(this.txtAddressSearch.value) != '') {
                        if (this.lastSearchString != lang.trim(this.txtAddressSearch.value)) {
                            this.lastSearchString = lang.trim(this.txtAddressSearch.value);
                            var _this = this;

                            /**
                            * clear any staged search
                            */
                            clearTimeout(this.stagedSearch);
                            if (lang.trim(this.txtAddressSearch.value).length > 0) {

                                /**
                                * stage a new search, which will launch if no new searches show up
                                * before the timeout
                                */
                                this.stagedSearch = setTimeout(function () {
                                    _this._locateAddress();
                                }, 500);
                            }
                        }
                    } else {
                        this.lastSearchString = lang.trim(this.txtAddressSearch.value);
                        domConstruct.empty(this.autocompleteResults);
                        domClass.replace(this.autocompleteResults, "displayNoneAll", "displayBlockAll");
                    }
                }
            },

            _locateAddress: function () {

                /**
                * call locator service specified in configuration file
                */
                var locatorSettings = dojo.configData.LocatorSettings;
                var locator = new Locator(locatorSettings.LocatorURL);
                var searchFieldName = locatorSettings.LocatorParameters.SearchField;
                var addressField = {};
                addressField[searchFieldName] = lang.trim(this.txtAddressSearch.value);
                var baseMapExtent = this.map.getLayer(this.basemapLayer).fullExtent;

                var options = {};
                options["address"] = addressField;
                options["outFields"] = locatorSettings.LocatorOutFields;
                options[locatorSettings.LocatorParameters.SearchBoundaryField] = baseMapExtent;
                locator.outSpatialReference = this.map.spatialReference;

                /**
                * get results from locator service
                * @param {object} options Contains address, outFields and basemap extent for locator service
                * @param {object} candidates Contains results from locator service
                */
                locator.addressToLocations(options);
                locator.on("address-to-locations-complete", lang.hitch(this, function (candidates) {
                    this._showLocatedAddress(candidates.addresses);
                }), function () {
                    domStyle.set(this.imgSearchLoader, "display", "none");
                    this._locatorErrBack();
                });
            },

            _showLocatedAddress: function (candidates) {
                domConstruct.empty(this.autocompleteResults);

                /**
                * display all the located address in the address container
                * 'this.divAddressResults' div dom element contains located addresses, created in widget template
                */
                if (candidates.length > 0) {
                    domClass.replace(this.autocompleteResults, "displayBlockAll", "displayNoneAll");
                    var hasValidRecords = false;
                    var validResult = true;
                    var locatorSettings = dojo.configData.LocatorSettings;
                    var searchFields = [];
                    var addressFieldName = locatorSettings.FilterFieldName;
                    var addressFieldValues = locatorSettings.FilterFieldValues;
                    for (var s in addressFieldValues) {
                        searchFields.push(addressFieldValues[s]);
                    }

                    for (var i in candidates) {
                        /**
                        * for every result returned by locator service verify if match score is greater than minimum match score specified in configuration file
                        */
                        if (candidates[i].attributes[locatorSettings.AddressMatchScore.Field] > locatorSettings.AddressMatchScore.Value) {
                            for (var j in searchFields) {
                                /**
                                * verify if FilterFieldName of results match with FilterFieldValues of locator settings specified in configuration file
                                */
                                if (candidates[i].attributes[addressFieldName].toUpperCase() == searchFields[j].toUpperCase()) {
                                    validResult = true;
                                } else {
                                    validResult = false;
                                }
                                /**
                                * display the result if it is valid
                                */
                                if (validResult) {
                                    hasValidRecords = this._displayValidLocations(candidates[i]);
                                }
                            }
                        }
                    }
                    if (!hasValidRecords) {
                        this._locatorErrBack();
                    }
                } else {
                    this.mapPoint = null;
                    this._locatorErrBack();
                }
            },

            /**
            * display error message if locator service fails or does not return any results
            */
            _locatorErrBack: function () {
                if (domClass.contains(this.autocompleteResults, "displayNoneAll")) {
                    domClass.replace(this.autocompleteResults, "displayBlockAll", "displayNoneAll");
                }
                this.spanErrResults = domConstruct.create('div', { "class": "esriCTCursorDefault", "innerHTML": nls.errorMessages.invalidSearch }, this.autocompleteResults);
            },

            //display a list of valid results
            _displayValidLocations: function (candidate) {
                var locatorSettings = dojo.configData.LocatorSettings;
                var tdData = domConstruct.create("div", { "class": "esriCTBottomBorder esriCTCursorPointer" }, this.autocompleteResults);
                try {
                    /**
                    * bind x, y co-ordinates and address of search result with respective row in search panel
                    */
                    tdData.innerHTML = string.substitute(locatorSettings.DisplayField, candidate.attributes);

                    domAttr.set(tdData, "x", candidate.location.x);
                    domAttr.set(tdData, "y", candidate.location.y);
                    domAttr.set(tdData, "address", string.substitute(locatorSettings.DisplayField, candidate.attributes));
                } catch (err) {
                    alert(nls.errorMessages.falseConfigParams);
                }
                var _this = this;
                tdData.onclick = function () {
                    /**
                    * display result on map on click of search result
                    */
                    _this.mapPoint = new esri.geometry.Point(domAttr.get(this, "x"), domAttr.get(this, "y"), _this.map.spatialReference);
                    _this.txtAddressSearch.value = this.innerHTML;
                    domAttr.set(_this.txtAddressSearch, "defaultAddress", this.innerHTML);
                    domConstruct.empty(_this.autocompleteResults);
                    domClass.replace(_this.autocompleteResults, "displayNoneAll", "displayBlockAll");
                    _this._locateAddressOnMap(_this.mapPoint);
                };
                return true;
            },

            /**
            * add push pin on the map
            * @param {object} mapPoint Map point of search result
            * @memberOf widgets/locator/locator
            */
            _locateAddressOnMap: function (mapPoint) {
                var geoLocationPushpin, locatorMarkupSymbol, graphic;
                this.map.setLevel(dojo.configData.ApplicationSettings.zoomLevel);
                this.map.centerAt(mapPoint);
                if (dojo.configData.ApplicationSettings.defaultLocatorSymbol.indexOf("http") == 0) {
                    geoLocationPushpin = dojo.configData.ApplicationSettings.defaultLocatorSymbol;
                } else {
                    geoLocationPushpin = dojoConfig.baseURL + dojo.configData.ApplicationSettings.defaultLocatorSymbol;
                }
                locatorMarkupSymbol = new esri.symbol.PictureMarkerSymbol(geoLocationPushpin, dojo.configData.ApplicationSettings.markupSymbolWidth, dojo.configData.ApplicationSettings.markupSymbolHeight);
                graphic = new esri.Graphic(mapPoint, locatorMarkupSymbol, {}, null);
                this.map.getLayer("esriGraphicsLayerMapSettings").clear();
                this.map.getLayer("esriGraphicsLayerMapSettings").add(graphic);
            }
        });
    });