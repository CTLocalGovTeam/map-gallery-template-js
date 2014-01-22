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
        "dojo/dom-attr",
        "dojo/dom",
        "dojo/text!./templates/leftPanel.html",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/i18n!nls/localizedStrings",
        "dojo/topic",
        "dojo/Deferred",
        "widgets/gallery/gallery",
        "dojo/query",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/on",
        "dojo/_base/lang",
        "dojo/dom-geometry",
        "dojo/_base/array",
        "dojo/NodeList-manipulate"
    ],
    function (declare, domConstruct, domAttr, dom, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, nls, topic, Deferred, Gallery, query, domClass, domStyle, on, lang, domGeom, array) {
        declare("collectUniqueTags", null, {

            setNodeValue: function (node, text) {
                if (text) {
                    domAttr.set(node, "innerHTML", text);
                }
            },

            //This function is used to collect all the tags in array
            collectTags: function (results, geoTag, prefixTag) {
                var groupItemsTagsdata = [];
                var geoTagCollection = [];
                dojo.geoTagArray = {};
                for (var i = 0; i < results.length; i++) {
                    for (var j = 0; j < results[i].tags.length; j++) {
                        var geoTagValue;
                        if (geoTag) {
                            geoTagValue = this._searchGeoTag(results[i].tags[j], geoTag, prefixTag);
                            if (geoTagValue == 0) {
                                if (!geoTagCollection[results[i].tags[j]]) {
                                    var tagValue = results[i].tags[j].replace(prefixTag, '');
                                    geoTagCollection[tagValue] = 1;
                                    dojo.geoTagArray[results[i].tags[j]] = { "key": results[i].tags[j], "value": tagValue };
                                } else {
                                    geoTagCollection[results[i].tags[j]]++;
                                }
                            }
                        }
                        if (geoTagValue != 0) {
                            if (!groupItemsTagsdata[results[i].tags[j]]) {
                                groupItemsTagsdata[results[i].tags[j]] = 1;
                            } else {
                                groupItemsTagsdata[results[i].tags[j]]++;
                            }
                        }
                    }
                }
                geoTagCollection = this._sortArray(geoTagCollection);
                groupItemsTagsdata = this._sortArray(groupItemsTagsdata);
                if (geoTagCollection.length == 0) {
                    geoTagCollection = null;
                }
                if (groupItemsTagsdata.length == 0) {
                    groupItemsTagsdata = null;
                }
                var tagsObj = {
                    "geoTagCollection": geoTagCollection,
                    "groupItemsTagsdata": groupItemsTagsdata
                };
                return tagsObj;
            },

            //This function sorts the the tag cloud array in order
            _sortArray: function (tagArray) {
                var sortedArray = [];
                for (var i in tagArray) {
                    if (tagArray.hasOwnProperty(i)) {
                        sortedArray.push({
                            key: i,
                            value: tagArray[i]
                        });
                    }
                }
                sortedArray.sort(function (a, b) {
                    if (a.value > b.value) {
                        return -1;
                    } else if (a.value < b.value) {
                        return 1;
                    }
                    return 0;
                });
                return sortedArray;
            },

            //This function search for the tags with the geo tag configured
            _searchGeoTag: function (tag, geoTag) {
                var geoTagValue = tag.toLowerCase().indexOf(geoTag.toLowerCase());
                return geoTagValue;
            }
        });

        declare("tagCloudObj", null, {

            //This function generates the Tag cloud based on the inputs provided
            generateTagCloud: function (tagsCollection, maxTags, fontsRange) {
                if (tagsCollection.length < maxTags) {
                    maxTags = tagsCollection.length;
                }
                var maxUsedTags = this._identifyMaxUsedTags(tagsCollection, maxTags);
                var fontSizeArray = this._generateFontSize(fontsRange.minValue, fontsRange.maxValue, maxUsedTags.length);
                var tagCloudTags = this._mergeTags(maxUsedTags, fontSizeArray);
                return tagCloudTags;
            },

            //This function identifies maximum used tags
            _identifyMaxUsedTags: function (tagsCollection, maxTagsToDisplay) {
                var maxUsedTags = [];
                for (var i = 0; i < maxTagsToDisplay; i++) {
                    maxUsedTags.push(tagsCollection[i]);
                }
                return maxUsedTags;
            },

            //This function generates the required font ranges for each and every tag in tag cloud
            _generateFontSize: function (min, max, count) {
                var diff = ((max - min) / (count - 1));
                var fontSizeArray = [];
                fontSizeArray.push(min);
                for (var i = 1; i < count; i++) {
                    var nextValue = fontSizeArray[i - 1] + diff;
                    fontSizeArray.push(nextValue);
                }
                return fontSizeArray.sort(function (a, b) {
                    if (a > b) {
                        return -1;
                    } else if (a < b) {
                        return 1;
                    }
                    return 0;
                });
            },

            //This function merges the display tags and font ranges in single array
            _mergeTags: function (maxUsedTags, fontSizeArray) {
                for (var i = 0; i < maxUsedTags.length; i++) {
                    maxUsedTags[i].fontSize = fontSizeArray[i];
                }
                return maxUsedTags.sort(function (a, b) {
                    if (a.key < b.key) {
                        return -1;
                    } else if (a.key > b.key) {
                        return 1;
                    }
                    return 0;
                });
            }
        });

        declare("leftPanelCollection", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Deferred], {
            templateString: template,
            nls: nls,

            postCreate: function () {
                dojo.sortBy = dojo.configData.AGOLItemSettings.sortField;
                if (query(".esriCTSortText")[0]) {
                    if ((dojo.sortBy == "modified") && (query(".esriCTSortText")[0].innerHTML != nls.sortByViewText)) {
                        domAttr.set(query(".esriCTSortText")[0], "innerHTML", nls.sortByViewText);
                    } else if ((dojo.sortBy == "numViews") && (query(".esriCTSortText")[0].innerHTML != nls.sortByDateText)) {
                        domAttr.set(query(".esriCTSortText")[0], "innerHTML", nls.sortByDateText);
                    }
                }
                this._setGroupContent();
                this._expandGroupdescEvent(this.expandGroupDescription, this);
                this._queryGroupItems();
                domAttr.set(this.leftPanelHeader, "innerHTML", dojo.configData.ApplicationName);
                topic.subscribe("queryGroupItems", this._queryGroupItems);
            },

            _queryGroupItems: function (nextQuery, queryString) {
                var _self = this;
                var groupItems = [];
                var defObj = new Deferred();
                if ((!nextQuery) && (!queryString)) {
                    dojo.queryString = 'group:("' + dojo.configData.ApplicationSettings.group + '")';
                    topic.publish("queryGroupItem", dojo.queryString, dojo.sortBy, dojo.configData.AGOLItemSettings.sortOrder.toLowerCase(), defObj);
                } else if (!queryString) {
                    topic.publish("queryGroupItem", null, null, null, defObj, nextQuery);
                }
                if (queryString) {
                    dojo.queryString = queryString;
                    topic.publish("queryGroupItem", dojo.queryString, dojo.sortBy, dojo.configData.AGOLItemSettings.sortOrder.toLowerCase(), defObj);
                }

                defObj.then(function (data) {
                    if (data.results.length > 0) {
                        if (data.nextQueryParams.start != -1) {
                            for (var i = 0; i < data.results.length; i++) {
                                groupItems.push(data.results[i]);
                            }
                            _self._queryGroupItems(data.nextQueryParams);
                        } else {
                            for (var i = 0; i < data.results.length; i++) {
                                groupItems.push(data.results[i]);
                            }
                            dojo.groupItems = groupItems;
                            _self._setLeftPanelContent(groupItems);
                        }
                    } else {
                        if (queryString) {
                            alert(nls.errorMessages.noPublicItems);
                        }
                    }
                }, function (err) {
                    alert(err.message);
                });
            },

            _setLeftPanelContent: function (results) {
                if (dojo.configData.ApplicationSettings.showCategoriesTagCloud || dojo.configData.ApplicationSettings.showGeographiesTagCloud) {
                    var uniqueTags = new collectUniqueTags();
                    var tagCloudArray = [];
                    var tagsObj = uniqueTags.collectTags(results, dojo.configData.ApplicationSettings.geographiesTagText, dojo.configData.ApplicationSettings.geographiesPrefixText);
                    var tagCloud = new tagCloudObj();
                    if (!dojo.configData.ApplicationSettings.tagCloudFontRange.minValue && !dojo.configData.ApplicationSettings.tagCloudFontRange.maxValue && dojo.configData.ApplicationSettings.tagCloudFontRange.units) {
                        dojo.configData.ApplicationSettings.tagCloudFontRange.minValue = 10;
                        dojo.configData.ApplicationSettings.tagCloudFontRange.maxValue = 18;
                        dojo.configData.ApplicationSettings.tagCloudFontRange.units = "px";
                    }
                    if (dojo.configData.ApplicationSettings.tagCloudFontRange.minValue > dojo.configData.ApplicationSettings.tagCloudFontRange.maxValue) {
                        alert(nls.errorMessages.minfontSizeGreater);
                        return;
                    }
                    if (dojo.configData.ApplicationSettings.showCategoriesTagCloud && tagsObj.groupItemsTagsdata) {
                        domStyle.set(this.tagsCategoriesContent, "display", "block");
                        uniqueTags.setNodeValue(this.tagsCategories, nls.tagCategoriesHeaderText);

                        var displayCategoryTags = tagCloud.generateTagCloud(tagsObj.groupItemsTagsdata, dojo.configData.ApplicationSettings.showMaxTopTags, dojo.configData.ApplicationSettings.tagCloudFontRange);
                        this.displayTagCloud(displayCategoryTags, this.tagsCategoriesCloud, this.tagsCategories.innerHTML, tagCloudArray);
                    }
                    if (dojo.configData.ApplicationSettings.showGeographiesTagCloud && dojo.configData.ApplicationSettings.geographiesTagText && tagsObj.geoTagCollection) {
                        domStyle.set(this.geographicTagsContent, "display", "block");
                        uniqueTags.setNodeValue(this.geoTagsCloudHeader, nls.geographicTagsHeaderText);

                        var displaygeoTags = tagCloud.generateTagCloud(tagsObj.geoTagCollection, dojo.configData.ApplicationSettings.showMaxTopTags, dojo.configData.ApplicationSettings.tagCloudFontRange);
                        this.displayTagCloud(displaygeoTags, this.geoTagsCloud, this.geoTagsCloudHeader.innerHTML, tagCloudArray);
                    }
                    this._appendLeftPanel();
                    var defObj = new Deferred();
                    var queryString = 'group:("' + dojo.configData.ApplicationSettings.group + '")';
                    if (dojo.configData.AGOLItemSettings.searchString) {
                        queryString += ' AND (';
                        queryString += ' title:' + dojo.configData.AGOLItemSettings.searchString;
                        queryString += ' OR tags:' + dojo.configData.AGOLItemSettings.searchString;
                        queryString += ' OR typeKeywords:' + dojo.configData.AGOLItemSettings.searchString;
                        queryString += ' OR snippet:' + dojo.configData.AGOLItemSettings.searchString;
                        queryString += ' ) ';
                    }

                    if (dojo.configData.AGOLItemSettings.searchType) {
                        queryString += ' AND type:' + dojo.configData.AGOLItemSettings.searchType;
                    }

                    dojo.queryString = queryString;
                    dojo.sortBy = dojo.configData.AGOLItemSettings.sortField;
                    topic.publish("queryGroupItem", dojo.queryString, dojo.sortBy, dojo.configData.AGOLItemSettings.sortOrder.toLowerCase(), defObj);
                    defObj.then(function (data) {
                        topic.publish("showProgressIndicator");
                        dojo.nextQuery = data.nextQueryParams;
                        var gallery = new itemGallery();
                        dojo.results = data.results;
                        gallery.createItemPods(data.results, false, data.total);
                    }, function (err) {
                        alert(err.message);
                    });
                } else {
                    this._appendLeftPanel();
                    var gallery = new itemGallery();
                }
            },

            //This function creates the required HTML for generating the tag cloud
            displayTagCloud: function (displayTags, node, text, tagCloudArray) {
                var _self = this;
                var selectedTags = "";

                for (var i = 0; i < displayTags.length; i++) {
                    var span = domConstruct.place(domConstruct.create('h3'), node);
                    domClass.add(span, "esriCTTagCloud");
                    domStyle.set(span, "fontSize", displayTags[i].fontSize + dojo.configData.ApplicationSettings.tagCloudFontRange.units);
                    if (i != (displayTags.length - 1)) {
                        domAttr.set(span, "innerHTML", displayTags[i].key + ", ");
                    } else {
                        domAttr.set(span, "innerHTML", displayTags[i].key + ".");
                    }
                    domAttr.set(span, "selectedTagCloud", text);
                    domAttr.set(span, "tagCloudValue", displayTags[i].key);
                    span.onclick = function () {
                        topic.publish("showProgressIndicator");
                        if (query(".esriCTNoResults")[0]) {
                            domConstruct.destroy(query(".esriCTNoResults")[0]);
                        }
                        var val = domAttr.get(this, "tagCloudValue");
                        for (var j in dojo.geoTagArray) {
                            if (dojo.geoTagArray[j].value == val) {
                                val = dojo.geoTagArray[j].key;
                            }
                        }
                        if (domClass.contains(this, "esriCTTagCloudHighlight")) {
                            domClass.remove(this, "esriCTTagCloudHighlight");
                            var index = array.indexOf(tagCloudArray, val);
                            if (index > -1) {
                                tagCloudArray.splice(index, 1);
                            }
                        } else {
                            domClass.add(this, "esriCTTagCloudHighlight");
                            tagCloudArray.push(val);
                        }

                        if (domGeom.position(query(".esriCTAutoSuggest")[0]).h > 0) {
                            domClass.replace(query(".esriCTAutoSuggest")[0], "displayNoneAll", "displayBlockAll");
                        }

                        if (selectedTags != "") {
                            selectedTags = tagCloudArray.join('"' + " AND " + '"');
                        } else {
                            selectedTags = val;
                        }
                        _self._queryRelatedTags(selectedTags);

                        if (query(".esriCTDetailsLeftPanel")[0]) {
                            domClass.replace(query(".esriCTMenuTabRight")[0], "displayBlockAll", "displayNoneAll");
                            domClass.add(query(".esriCTDetailsLeftPanel")[0], "displayNoneAll");
                            domClass.add(query(".esriCTDetailsRightPanel")[0], "displayNoneAll");
                            domClass.remove(query(".esriCTGalleryContent")[0], "displayNoneAll");
                            domClass.remove(query(".esriCTInnerRightPanel")[0], "displayNoneAll");
                        }
                    };
                }
            },

            _queryRelatedTags: function (tagName) {
                var defObj = new Deferred();
                dojo.queryString = 'group:("' + dojo.configData.ApplicationSettings.group + '")' + ' AND (tags: ("' + tagName + '"))';
                topic.publish("queryGroupItem", dojo.queryString, dojo.sortBy, dojo.configData.AGOLItemSettings.sortOrder.toLowerCase(), defObj);
                defObj.then(function (data) {
                    if (data.total == 0) {
                        if (query(".esriCTInnerRightPanel")[0]) {
                            domClass.replace(query(".esriCTInnerRightPanel")[0], "displayNoneAll", "displayBlockAll");
                        }
                        if (query(".esriCTNoResults")[0]) {
                            domConstruct.destroy(query(".esriCTNoResults")[0]);
                        }
                        domConstruct.create('div', { "class": "esriCTDivClear esriCTNoResults", "innerHTML": nls.noResultsText }, query(".esriCTRightPanel")[0]);
                        if (domClass.contains(query(".esriCTInnerRightPanel")[0], "displayNone")) {
                            domClass.replace(query(".esriCTNoResults")[0], "displayNoneAll", "displayBlockAll");
                        } else {
                            domClass.replace(query(".esriCTNoResults")[0], "displayBlockAll", "displayNoneAll");
                        }
                        topic.publish("hideProgressIndicator");
                    } else {
                        if (query(".esriCTNoResults")[0]) {
                            domConstruct.destroy(query(".esriCTNoResults")[0]);
                        }
                        domClass.replace(query(".esriCTInnerRightPanel")[0], "displayBlockAll", "displayNoneAll");
                        dojo.nextQuery = data.nextQueryParams;
                        dojo.results = data.results;
                        topic.publish("createPods", data.results, true);
                    }
                }, function (err) {
                    alert(err.message);
                    topic.publish("hideProgressIndicator");
                });
            },

            //This function shrinks or expands the group description content based on the click event
            _expandGroupdescEvent: function (node, _self) {
                node.onclick = function () {
                    if (this.innerHTML == nls.expandGroupDescText) {
                        domAttr.set(this, "innerHTML", nls.shrinkGroupDescText);
                    } else {
                        domAttr.set(this, "innerHTML", nls.expandGroupDescText);
                    }
                    domClass.toggle(_self.groupDesc, "esriCTLeftTextReadLess");
                };
            },

            //This function sets the required group content in the containers
            _setGroupContent: function () {
                var _self = this;
                if (dojo.configData.groupIcon) {
                    _self.groupLogo.src = dojo.configData.groupIcon;
                }
                if (dojo.configData.groupTitle) {
                    _self.setNodeText(_self.groupName, dojo.configData.groupTitle);
                }
                if (dojo.configData.AGOLItemSettings.groupDescription) {
                    _self.setNodeText(_self.groupDesc, dojo.configData.AGOLItemSettings.groupDescription);
                    if (query(_self.groupDesc).text().length > 400) {
                        domClass.add(_self.groupDesc, "esriCTLeftTextReadLess");
                        if (nls.expandGroupDescText) {
                            _self.setNodeText(_self.expandGroupDescription, nls.expandGroupDescText);
                        }
                    }
                }
                if (dojo.configData.ApplicationName) {
                    _self.setNodeText(_self.groupDescPanelHeader, dojo.configData.ApplicationName);
                    topic.publish("setGrpContent");
                }
            },

            //This function is used to set the innerHTML
            setNodeText: function (node, htmlString) {
                if (node) {
                    domAttr.set(node, "innerHTML", htmlString);
                }
            },

            //This function append the left panel to parent container
            _appendLeftPanel: function () {
                var applicationHeaderDiv = dom.byId("esriCTParentDivContainer");
                domConstruct.place(this.galleryandPannels, applicationHeaderDiv);
            }
        });
    });