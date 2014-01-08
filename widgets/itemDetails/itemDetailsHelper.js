/*global dojo,define,document */
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
                this.own(on(this.addressSearchIcon, "click", lang.hitch(this, function () {
                    this._locateAddress();
                })));
                this.own(on(this.txtAddressSearch, "keyup", lang.hitch(this, function (evt) {
                    this._submitAddress(evt);
                })));
                this.own(on(this.txtAddressSearch, "dblclick", lang.hitch(this, function (evt) {
                    topic.publish("clearDefaultText", evt);
                })));
                this.own(on(this.txtAddressSearch, "focus", lang.hitch(this, function () {
                    domClass.add(this.txtAddressSearch, "esriCTColorChange");
                })));
            },

            _submitAddress: function (evt) {
                if (evt) {
                    if (evt.keyCode == dojo.keys.ENTER) {
                        if (this.txtAddressSearch.value != '') {
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
                var locatorSettings = dojo.configData.LocatorSettings.itemsLocator;
                var locator = new Locator(locatorSettings[0].LocatorURL);
                var searchFieldName = locatorSettings[0].LocatorParameters.SearchField;
                var addressField = {};
                addressField[searchFieldName] = lang.trim(this.txtAddressSearch.value);
                var baseMapExtent = this.map.getLayer(this.basemapLayer).fullExtent;

                var options = {};
                options["address"] = addressField;
                options["outFields"] = locatorSettings[0].LocatorOutFields;
                options[locatorSettings[0].LocatorParameters.SearchBoundaryField] = baseMapExtent;
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
                    var locatorSettings = dojo.configData.LocatorSettings.itemsLocator;
                    var searchFields = [];
                    var addressFieldName = locatorSettings[0].AddressSearch.FilterFieldName;
                    var addressFieldValues = locatorSettings[0].AddressSearch.FilterFieldValues;
                    var placeFieldName = locatorSettings[0].PlaceNameSearch.FilterFieldName;
                    var placeFieldValues = locatorSettings[0].PlaceNameSearch.FilterFieldValues;
                    for (var s in addressFieldValues) {
                        searchFields.push(addressFieldValues[s]);
                    }
                    if (locatorSettings[0].PlaceNameSearch.enabled) {
                        searchFields.push(locatorSettings[0].PlaceNameSearch.LocatorFieldValue);
                    }

                    for (var i in candidates) {
                        /**
                        * for every result returned by locator service verify if match score is greater than minimum match score specified in configuration file
                        */
                        if (candidates[i].attributes[locatorSettings[0].AddressMatchScore.Field] > locatorSettings[0].AddressMatchScore.Value) {
                            for (j in searchFields) {
                                /**
                                * verify if FilterFieldName of results match with FilterFieldValues of locator settings specified in configuration file
                                */
                                if (candidates[i].attributes[addressFieldName].toUpperCase() == searchFields[j].toUpperCase()) {
                                    if (candidates[i].attributes[addressFieldName].toUpperCase() == locatorSettings[0].PlaceNameSearch.LocatorFieldValue.toUpperCase()) {
                                        for (var placeField in placeFieldValues) {
                                            if (candidates[i].attributes[placeFieldName].toUpperCase() != placeFieldValues[placeField].toUpperCase()) {
                                                validResult = false;
                                            } else {
                                                validResult = true;
                                                break;
                                            }
                                        }
                                    } else {
                                        validResult = true;
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
                    }
                    if (!hasValidRecords) {
                        domClass.replace(this.autocompleteResults, "displayNoneAll", "displayBlockAll");
                    }
                } else {
                    this.mapPoint = null;
                    domClass.replace(this.autocompleteResults, "displayNoneAll", "displayBlockAll");
                }
            },

            _displayValidLocations: function (candidate) {
                var locatorSettings = dojo.configData.LocatorSettings.itemsLocator;
                var tdData = domConstruct.create("div", { "class": "esriCTBottomBorder esriCTCursorPointer" }, this.autocompleteResults);
                try {
                    /**
                    * bind x, y co-ordinates and address of search result with respective row in search panel
                    */
                    tdData.innerHTML = string.substitute(locatorSettings[0].DisplayField, candidate.attributes);

                    domAttr.set(tdData, "x", candidate.location.x);
                    domAttr.set(tdData, "y", candidate.location.y);
                    domAttr.set(tdData, "address", string.substitute(locatorSettings[0].DisplayField, candidate.attributes));
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
                var hasValidRecord = true;
                return hasValidRecord;
            },

            /**
            * add push pin on the map
            * @param {object} mapPoint Map point of search result
            * @memberOf widgets/locator/locator
            */
            _locateAddressOnMap: function (mapPoint) {
                var geoLocationPushpin, locatorMarkupSymbol, graphic;
                this.map.setLevel(dojo.configData.LocatorSettings.ZoomLevel);
                this.map.centerAt(mapPoint);
                geoLocationPushpin = dojoConfig.baseURL + dojo.configData.LocatorSettings.DefaultLocatorSymbol;
                locatorMarkupSymbol = new esri.symbol.PictureMarkerSymbol(geoLocationPushpin, "35", "35");
                graphic = new esri.Graphic(mapPoint, locatorMarkupSymbol, {}, null);
                this.map.getLayer("esriGraphicsLayerMapSettings").clear();
                this.map.getLayer("esriGraphicsLayerMapSettings").add(graphic);
            }
        });
    });