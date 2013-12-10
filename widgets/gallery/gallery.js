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
        "dojo/text!./templates/gallery.html",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/i18n!nls/localizedStrings",
        "widgets/itemDetails/itemDetails",
        "dojo/query",
        "dojo/dom-class",
        "dojo/on",
        "dojo/Deferred",
        "dojo/number",
        "dojo/topic",
        "dojo/dom-style",
        "esri/arcgis/utils"
    ],
    function (declare, domConstruct, lang, array, domAttr, dom, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, nls, ItemDetails, query, domClass, on, Deferred, number, topic, domStyle, utils) {
        declare("itemGallery", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            templateString: template,
            nls: nls,
            postCreate: function () {
                var applicationHeaderDiv = dom.byId("esriCTParentDivContainer");
                domConstruct.place(this.galleryView, query(".esriCTContentdiv")[0]);
                this.own(topic.subscribe("createPods", lang.hitch(this, this.createItemPods)));
                this.own(on(this.galleryPrevious, "click", lang.hitch(this, function () {
                    var defObj = new Deferred();
                    if (!dojo.prevQuery) {
                        return;
                    }
                    var _self = this;
                    topic.publish("queryGroupItem", null, null, null, null, defObj, dojo.prevQuery);
                    defObj.then(function (data) {
                        dojo.nextQuery = data.nextQueryParams;
                        _self._prevItem(data);
                        _self.createItemPods(data.results);
                    }, function (err) {
                        alert(err.message);
                    });
                })));

                this.own(on(this.galleryNext, "click", lang.hitch(this, function () {
                    var defObj = new Deferred();
                    var _self = this;
                    if (dojo.nextQuery.start == -1) {
                        return;
                    }
                    topic.publish("queryGroupItem", null, null, null, null, defObj, dojo.nextQuery);
                    defObj.then(function (data) {
                        dojo.nextQuery = data.nextQueryParams;
                        _self._prevItem(data);
                        _self.createItemPods(data.results);
                    }, function (err) {
                        alert(err.message);
                    });
                })));
            },

            _prevItem: function (data) {
                dojo.prevQuery = {
                    num: data.queryParams.num,
                    q: data.queryParams.q,
                    sortField: data.queryParams.sortField,
                    sortOrder: data.queryParams.sortOrder,
                    start: data.queryParams.start - data.queryParams.num
                }
            },

            createItemPods: function (itemResults) {
                domConstruct.empty(this.itemPodsList);
                for (var i = 0; i < itemResults.length; i++) {
                    if (!dojo.configData.gridView) {
                        var divPodParent = domConstruct.create('div', { "class": "esriCTApplicationListBox" }, this.itemPodsList);
                        this._createThumbnails(itemResults[i], divPodParent);
                        this._createItemOverviewPanel(itemResults[i], divPodParent);
                    } else {
                        var divPodParent = domConstruct.create('div', { "class": "esriCTApplicationBox" }, this.itemPodsList);
                        this._createThumbnails(itemResults[i], divPodParent);
                        this._createGridItemOverview(itemResults[i], divPodParent);
                    }
                }
                topic.publish("hideProgressIndicator");
            },

            _createGridItemOverview: function (itemResult, divPodParent) {
                var divItemTitleRight = domConstruct.create('div', { "class": "divclear" }, divPodParent);
                var divItemTitleText = domConstruct.create('div', { "class": "esriCTListAppTitle gridTitleHeight esriCTCursorPointer" }, divItemTitleRight);
                domAttr.set(divItemTitleText, "innerHTML", (itemResult.title) ? (itemResult.title) : (nls.showNullValue));
                var divItemWatchEye = domConstruct.create('div', { "class": "esriCTEyewatch" }, divPodParent);
                var spanItemWatchEye = domConstruct.create('span', { "class": "eye icon-eye" }, divItemWatchEye);
                var spanItemWatchEye = domConstruct.create('span', { "class": "view" }, divItemWatchEye);
                domAttr.set(spanItemWatchEye, "innerHTML", (itemResult.numViews) ? (number.format(parseInt(itemResult.numViews, 10))) : (nls.showNullValue));
                var divItemReadMore = domConstruct.create('span', { "class": "readmore readmoreGrid" }, divPodParent);
                domAttr.set(divItemReadMore, "innerHTML", nls.detailsDisplayText);
                domAttr.set(divItemReadMore, "itemId", itemResult.itemUrl);
                this.own(on(divItemTitleText, "click", lang.hitch(this, function () {
                    topic.publish("showProgressIndicator");
                    this.showInfoPage(this, itemResult);
                })));
                this.own(on(divItemReadMore, "click", lang.hitch(this, function () {
                    topic.publish("showProgressIndicator");
                    this.showInfoPage(this, itemResult);
                })));
            },

            _createThumbnails: function (itemResult, divPodParent) {
                if (!dojo.configData.gridView) {
                    var divThumbnail = domConstruct.create('div', { "class": "esriCTImageContainerList" }, divPodParent);
                } else {
                    var divThumbnail = domConstruct.create('div', { "class": "esriCTImageContainer" }, divPodParent);
                }

                var divThumbnailImage = domConstruct.create('div', { "class": "esriCTAppImage" }, divThumbnail);
                if (itemResult.thumbnailUrl) {
                    domStyle.set(divThumbnailImage, "background", 'url(' + itemResult.thumbnailUrl + ') no-repeat center center');
                } else {
                    domStyle.set(divThumbnailImage, "background", "url(./themes/images/NotAvailable.png) no-repeat center center");
                }
                var divItemType = domConstruct.create('div', { "class": "esriCTApplicationType" }, divThumbnail);
                domAttr.set(divItemType, "innerHTML", (itemResult.type) ? (itemResult.type) : (nls.shoNullValue));
                var divThumbnailTopPanel = domConstruct.create('div', { "class": "esriCTImageTopPanel" }, divThumbnailImage);

                var divTagContainer = domConstruct.create('div', { "class": "esriCTTagbg" }, divThumbnailTopPanel);
                var divTagContent = domConstruct.create('div', { "class": "esriCTTag" }, divTagContainer);

                if (dojo.configData.ApplicationSettings.displaySharingAttribute) {
                    this._accessLogoType(itemResult, divTagContent);
                }
                if (dojo.configData.gridView) {
                    var divItemContent = domConstruct.create('div', { "class": "esriCTAppcontent" }, divPodParent);
                }
                domAttr.set(divThumbnailImage, "selectedItem", itemResult.id);
                domAttr.set(divThumbnailImage, "selectedThumbnail", itemResult.thumbnailUrl);
                this.own(on(divThumbnailImage, "click", lang.hitch(this, function () {
                    var itemId = domAttr.get(divThumbnailImage, "selectedItem");
                    var thumbnailURL = domAttr.get(divThumbnailImage, "selectedThumbnail");
                    if (dojo.configData.ApplicationSettings.useItemPage) {
                        var thumbnailInfoPage = new itemInfoPage();
                        thumbnailInfoPage.displayPanel(itemResult, this, itemId, thumbnailURL);
                    } else {
                        this._showItemOverview(itemId, thumbnailURL);
                    }
                })));
            },

            _showItemOverview: function (itemId, thumbnailURL) {
                var tokenString;
                if (dojo.configData.ApplicationSettings.token) {
                    tokenString = "&token=" + dojo.configData.ApplicationSettings.token;
                } else {
                    tokenString = '';
                }
                var itemURL1 = dojo.configData.ApplicationSettings.portalURL + "/sharing/content/items/" + itemId + "?f=json" + tokenString;
                var defObj = new Deferred();
                defObj.then(function (data) {
                    if (data) {
                        data.thumbnailUrl = thumbnailURL;
                        if ((data.type == "Map Service") || (data.type == "Web Map") || (data.type == "Feature Service") || (data.type == "KML") || (data.type == "WMS")) {
                            var item = new ItemDetails({ data: data });
                        } else {
                            if (data.url) {
                                window.open(data.url);
                            } else if (data.itemType == "file") {
                                var tokenString;
                                if (dojo.configData.ApplicationSettings.token) {
                                    tokenString = "?token=" + dojo.configData.ApplicationSettings.token;
                                } else {
                                    tokenString = '';
                                }
                                downloadPath = dojo.configData.ApplicationSettings.portalURL + "/sharing/content/items/" + itemId + "/data" + tokenString;
                                window.open(downloadPath);
                            } else {
                                alert(nls.errorMessages.unableToOpenItem);
                            }
                        }
                    }
                });
                topic.publish("queryItemInfo", itemURL1, defObj);
            },

            _accessLogoType: function (itemResult, divTagContent) {
                var title;
                if (itemResult.access == "public") {
                    title = nls.allText;
                } else if (itemResult.access == "org") {
                    title = nls.orgText;
                } else {
                    title = nls.grpText;
                }
                if (divTagContent) {
                    domAttr.set(divTagContent, "innerHTML", title);
                }
            },

            _createItemOverviewPanel: function (itemResult, divPodParent) {
                var divContent = domConstruct.create('div', { "class": "esriCTListContent" }, divPodParent);
                var divTitle = domConstruct.create('div', { "class": "esriCTAppListTitle" }, divContent);
                var divAppIcon = domConstruct.create('div', { "class": "esriCTListAppIcon" }, divTitle);

                var divItemTitle = domConstruct.create('div', { "class": "esriCTAppListTitleRight" }, divTitle);
                var divItemTitleRight = domConstruct.create('div', { "class": "divclear" }, divItemTitle);
                var divItemTitleText = domConstruct.create('div', { "class": "esriCTListAppTitle esriCTCursorPointer" }, divItemTitleRight);
                domAttr.set(divItemTitleText, "innerHTML", (itemResult.title) ? (itemResult.title) : (nls.showNullValue));
                var divItemWatchEye = domConstruct.create('div', { "class": "esriCTEyewatch" }, divItemTitleRight);
                var spanItemWatchEye = domConstruct.create('span', { "class": "eye icon-eye" }, divItemWatchEye);
                var spanItemWatchEye = domConstruct.create('span', { "class": "view" }, divItemWatchEye);
                domAttr.set(spanItemWatchEye, "innerHTML", (itemResult.numViews) ? (number.format(parseInt(itemResult.numViews, 10))) : (nls.showNullValue));
                var divModifiedDate = domConstruct.create('div', { "class": "esriCTListMdfDate" }, divItemTitle);
                divModifiedDate.innerHTML = ((itemResult.type) ? (itemResult.type) : (nls.showNullValue)) +
                    " by " + ((itemResult.owner) ? (itemResult.owner) : (nls.showNullValue)) +
                    " Last modified " + ((itemResult.modified) ? ((new Date(itemResult.modified)).toLocaleDateString()) : (nls.showNullValue)) + ".";

                var divItemContent = domConstruct.create('div', { "class": "esriCTListAppcontent" }, divContent);
                var divItemSnippet = domConstruct.create('div', { "class": "esriCTAppHeadline" }, divItemContent);

                var spanItemReadMore = domConstruct.create('span', {}, divItemSnippet);
                domAttr.set(spanItemReadMore, "innerHTML", (itemResult.snippet) ? (itemResult.snippet) : (nls.showNullValue));
                var divItemReadMore = domConstruct.create('span', { "class": "readmore" }, divItemSnippet);
                domAttr.set(divItemReadMore, "innerHTML", nls.readMoreDisplayText);
                domAttr.set(divItemReadMore, "itemId", itemResult.itemUrl);
                this.own(on(divItemTitleText, "click", lang.hitch(this, function () {
                    topic.publish("showProgressIndicator");
                    this.showInfoPage(this, itemResult);
                })));
                this.own(on(divItemReadMore, "click", lang.hitch(this, function () {
                    topic.publish("showProgressIndicator");
                    this.showInfoPage(this, itemResult);
                })));
            },

            showInfoPage: function (_self, itemResult) {
                var infoPage = new itemInfoPage();
                infoPage.displayPanel(itemResult, _self, null, null);
            }
        });

        declare("itemInfoPage", null, {
            displayPanel: function (itemResult, _self, itemId, thumbnailURL) {
                domClass.replace(query(".esriCTMenuTabRight")[0], "displayNoneAll", "displayBlockAll");
                domClass.add(query(".esriCTInnerRightPanel")[0], "displayNoneAll");
                domClass.remove(_self.detailsLeftPanel, "displayNoneAll");
                domClass.remove(_self.detailsRightPanel, "displayNoneAll");
                domConstruct.empty(_self.detailsContent);
                domConstruct.empty(_self.ratingsContainer);
                if (itemResult.thumbnailUrl) {
                    domAttr.set(_self.appThumbnail, "src", itemResult.thumbnailUrl);
                } else {
                    domAttr.set(_self.appThumbnail, "src", "./themes/images/NotAvailable.png");
                }

                domAttr.set(_self.appTypeTag, "innerHTML", (itemResult.type) ? (itemResult.type) : (nls.showNullValue));
                domAttr.set(_self.applicationType, "innerHTML", (itemResult.type) ? (itemResult.type) : (nls.showNullValue));
                domAttr.set(_self.appTitle, "innerHTML", (itemResult.title) ? (itemResult.title) : (nls.showNullValue));
                if (dojo.configData.AGOLItemSettings.showNumberOfViews) {
                    var numberOfComments = (itemResult.numComments) ? (itemResult.numComments) : "0";
                    var numberOfRatings = (itemResult.numRatings) ? (itemResult.numRatings) : "0";
                    var numberOfViews = (itemResult.numViews) ? (number.format(parseInt(itemResult.numViews, 10))) : "0";
                    var itemReviewDetails = "(" + numberOfComments + " " + nls.numberOfCommentsText + ", " + numberOfRatings + " " + nls.numberOfRatingsText + ", " + numberOfViews + " " + nls.numberOfViewsText + ")";
                    domAttr.set(_self.numOfCommentsViews, "innerHTML", itemReviewDetails);
                }
                domAttr.set(_self.itemSnippet, "innerHTML", (itemResult.snippet) ? (itemResult.snippet) : (nls.showNullValue));
                var descHeader = domConstruct.create('div', { "class": "esriCTReviewhead", "innerHTML": nls.appDesText }, _self.detailsContent);
                var itemDescription = domConstruct.create('div', { "class": "esriCTText esriCTReviewContainer bottomBorder" }, _self.detailsContent);
                if (dojo.configData.AGOLItemSettings.showAccessAndConstraints) {
                    var accessContainer = domConstruct.create('div', { "class": "esriCTReviewContainer bottomBorder" }, _self.detailsContent);
                    var accessHeader = domConstruct.create('div', { "class": "esriCTReviewhead", "innerHTML": nls.accessConstraintsText }, accessContainer);
                    var accessInfo = domConstruct.create('div', { "class": "esriCTText" }, accessContainer);
                    domAttr.set(accessInfo, "innerHTML", (itemResult.licenseInfo) ? (itemResult.licenseInfo) : (nls.showNullValue));
                }
                domAttr.set(_self.btnTryItNow, "innerHTML", " ");
                var defObj = new Deferred();
                defObj.then(function (data) {
                    domAttr.set(itemDescription, "innerHTML", (itemResult.description) ? (itemResult.description) : (nls.showNullValue));
                    domAttr.set(_self.itemCategory, "innerHTML", (itemResult.title) ? (itemResult.title) : (nls.showNullValue));
                    domAttr.set(_self.itemSubmittedBy, "innerHTML", (itemResult.owner) ? (itemResult.owner) : (nls.showNullValue));
                    var tokenString;
                    if (dojo.configData.ApplicationSettings.token) {
                        tokenString = "&token=" + dojo.configData.ApplicationSettings.token;
                    } else {
                        tokenString = '';
                    }
                    var itemURL1 = dojo.configData.ApplicationSettings.portalURL + "/sharing/content/items/" + itemResult.id + "?f=json" + tokenString;
                    var defObject = new Deferred();
                    defObject.then(function (data) {
                        if (data) {
                            if (data.itemType == "file") {
                                domAttr.set(_self.btnTryItNow, "innerHTML", nls.downloadButtonText);
                            } else {
                                domAttr.set(_self.btnTryItNow, "innerHTML", nls.tryItButtonText);
                            }
                        }
                        topic.publish("hideProgressIndicator");
                    }, function (err) {
                        alert(err.message);
                        topic.publish("hideProgressIndicator");
                    });
                    topic.publish("queryItemInfo", itemURL1, defObject);
                    if (dojo.configData.AGOLItemSettings.showReviews) {
                        var reviewContainer = domConstruct.create('div', { "class": "esriCTReviewContainer bottomBorder" }, _self.detailsContent);
                        domConstruct.create('div', { "class": "esriCTReviewhead", "innerHTML": nls.reviewText }, reviewContainer);
                        itemResult.getComments().then(function (result) {
                            if (result.length > 0) {
                                for (var i = 0; i < result.length; i++) {
                                    var divReview = domConstruct.create('div', { "class": "esriCTReview" }, reviewContainer);
                                    var divReviewHeader = domConstruct.create('div', { "class": "esriCTReviewbold" }, divReview);
                                    var divReviewText = domConstruct.create('div', { "class": "esriCTReviewtext breakWord" }, divReview);
                                    domAttr.set(divReviewHeader, "innerHTML", (result[i].created) ? (result[i].created.toLocaleDateString()) : (nls.showNullValue));
                                    try {
                                        var comment = decodeURIComponent(result[i].comment)
                                    } catch (e) {
                                        var comment = unescape(result[i].comment);
                                    }
                                    domAttr.set(divReviewText, "innerHTML", (result[i].comment) ? (comment) : (nls.showNullValue));
                                }
                            } else {
                                var divReview = domConstruct.create('div', { "class": "divclear" }, reviewContainer);
                                var divReviewText = domConstruct.create('div', { "class": "breakWord" }, divReview);
                                domAttr.set(divReviewText, "innerHTML", nls.showNullValue);
                            }
                        });
                    }
                    if (dojo.configData.AGOLItemSettings.showRatings) {
                        var numberStars = Math.round(itemResult.avgRating);
                        for (var i = 0; i < 5; i++) {
                            var imgRating = document.createElement("img");
                            imgRating.value = (i + 1);
                            domAttr.set(imgRating, "src", "themes/images/rating_empty.png");
                            _self.ratingsContainer.appendChild(imgRating);
                            if (i < numberStars) {
                                domAttr.set(imgRating, "src", "themes/images/rating_full.png");
                            }
                        }
                    }
                    domAttr.set(_self.btnTryItNow, "selectedItem", itemResult.id);
                    domAttr.set(_self.btnTryItNow, "selectedThumbnail", itemResult.thumbnailUrl);
                }, function (err) {
                    alert(err.message);
                });
                if (dojo.configData.AGOLItemSettings.showAttribution) {
                    this._createPropertiesContent(itemResult, _self.detailsContent, defObj);
                } else {
                    defObj.resolve();
                    topic.publish("hideProgressIndicator");
                }
                if (_self._btnTryItNowHandle) {
                    _self._btnTryItNowHandle.remove()
                }
                _self._btnTryItNowHandle = on(_self.btnTryItNow, "click", lang.hitch(this, function () {
                    var itemId = domAttr.get(_self.btnTryItNow, "selectedItem");
                    var thumbnailURL = domAttr.get(_self.btnTryItNow, "selectedThumbnail");
                    _self._showItemOverview(itemId, thumbnailURL);
                }));
            },

            _createPropertiesContent: function (itemResult, detailsContent, defObj) {
                var itemDeferred = utils.getItem(itemResult.id);
                itemDeferred.addCallback(function (itemInfo) {
                    var propertiesContainer = domConstruct.create('div', { "class": "esriCTReviewContainer" }, detailsContent);
                    domConstruct.create('div', { "innerHTML": nls.propertiesText, "class": "esriCTReviewhead" }, propertiesContainer);
                    var tagsContent = domConstruct.create('div', { "class": "propertiesTblcontent" }, propertiesContainer);
                    var tagsKey = domConstruct.create('div', { "class": "esriCTPropertiesContent", "innerHTML": nls.tagsText }, tagsContent);
                    for (var i = 0; i < itemInfo.item.tags.length; i++) {
                        if (i == 0) {
                            var tags1 = itemInfo.item.tags[i];
                        } else {
                            var tags1 = tags1 + ", " + itemInfo.item.tags[i];
                        }
                    }
                    var tagsValue = domConstruct.create('div', { "class": "esriCTPropertiesValue", "innerHTML": tags1 }, tagsContent);
                    var sizeContent = domConstruct.create('div', { "class": "propertiesTblcontent" }, propertiesContainer);
                    var sizeKey = domConstruct.create('div', { "class": "esriCTPropertiesContent", "innerHTML": nls.sizeText }, sizeContent);
                    var sizeValue = domConstruct.create('div', { "class": "esriCTPropertiesValue", "innerHTML": itemInfo.item.size }, sizeContent);
                    var tagsContent = domConstruct.create('div', { "class": "propertiesTblcontent" }, propertiesContainer);
                    var extentKey = domConstruct.create('div', { "class": "esriCTPropertiesContent", "innerHTML": nls.extentText }, tagsContent);
                    var extentValue = domConstruct.create('div', { "class": "esriCTPropertiesValue" }, tagsContent);
                    if (itemInfo.item.extent.length > 0) {
                        var extentUpper = domConstruct.create('div', {}, extentValue);
                        domConstruct.create('span', { "innerHTML": nls.extentLeftText, "class": "esriCTExtentSpan" }, extentUpper);
                        domConstruct.create('span', { "innerHTML": itemInfo.item.extent[0][0], "class": "esriCTExtentSpan" }, extentUpper);
                        domConstruct.create('span', { "innerHTML": nls.extentRightText, "class": "esriCTExtentSpan" }, extentUpper);
                        domConstruct.create('span', { "innerHTML": itemInfo.item.extent[1][0], "class": "esriCTExtentSpan" }, extentUpper);
                        var extentLower = domConstruct.create('div', {}, extentValue);
                        domConstruct.create('span', { "innerHTML": nls.extentTopText, "class": "esriCTExtentSpan" }, extentLower);
                        domConstruct.create('span', { "innerHTML": itemInfo.item.extent[0][1], "class": "esriCTExtentSpan" }, extentLower);
                        domConstruct.create('span', { "innerHTML": nls.extentBottomText, "class": "esriCTExtentSpan" }, extentLower);
                        domConstruct.create('span', { "innerHTML": itemInfo.item.extent[1][1], "class": "esriCTExtentSpan" }, extentLower);
                    }
                    domClass.add(propertiesContainer, "bottomBorder");
                    defObj.resolve();
                });
                itemDeferred.addErrback(function (error) {
                    defObj.resolve();
                    topic.publish("hideProgressIndicator");
                });
            }
        });
    });