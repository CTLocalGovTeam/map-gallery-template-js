﻿/*global dojo */
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
define([], function () {
    return {

        // This file contains various configuration settings for esri template
        //
        // Use this file to perform the following:
        //
        // 1.  Specify application Name                      - [ Tag(s) to look for: ApplicationName ]
        // 2.  Set path for application icon                 - [ Tag(s) to look for: ApplicationIcon ]
        // 3.  Set path for application favicon              - [ Tag(s) to look for: ApplicationFavicon ]
        // 4.  Set path for custom map logo                  - [ Tag(s) to look for: CustomLogoUrl ]
        // 5.  Set the default value to search               - [ Tag(s) to look for: ItemSearchDefaultValue ]
        // 6.  Customize application settings here           - [ Tag(s) to look for: ApplicationSettings ]
        // 7.  Customize AGOL settings here                  - [ Tag(s) to look for: AGOLItemSettings ]
        // 8.  Specify header widget settings                - [ Tag(s) to look for: AppHeaderWidgets ]
        // 9.  Specify URLs for base maps                    - [ Tag(s) to look for: BaseMapLayers ]
        // 10.  Customize address search settings            - [ Tag(s) to look for: LocatorSettings]

        // ------------------------------------------------------------------------------------------------------------------------
        // GENERAL SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------
        // Set application title
        ApplicationName: "Map Gallery",

        // Set application icon path
        ApplicationIcon: "/themes/images/logo.png",

        // Set application Favicon path
        ApplicationFavicon: "/themes/images/favicon.ico",

        // Set custom map logo path
        CustomLogoUrl: "",

        // Set the default value to search
        ItemSearchDefaultValue: "Web Map",

        //------------------------------------------------------------------------------------------------------------------------
        // Header Widget Settings
        //------------------------------------------------------------------------------------------------------------------------
        // group: Set the Group id for the application
        // theme: Set the application theme. If blank, default blue theme will be loaded. Supported theme keys are blueTheme, greenTheme and redTheme.
        // showCategoriesTagCloud: Set this variable to enable or disable categories tag cloud
        // showGeographiesTagCloud: Set this variable to enable or disable geographies tag cloud
        // geographiesTagText: Set this variable to search text for search in tags in geographies tag cloud. If set to blank,
        //                     geographies tag cloud will not be displayed irrespective of the value for showGeographiesTagCloud
        // geographiesPrefixText: Set this variable to trim text from geographies tag cloud. If set to blank,
        //                        geographies tag cloud will  be displayed as is. Case sensitive.
        // enableAutoComplete: Set this variable to enable or disable autocomplete on item search
        // tagCloudFontRange:
        //                minValue: Set min value of the tag cloud font,
        //                maxValue: set the max value of the tag cloud font,
        //                units: Set the units for the text in tag cloud. UI will be distorted if font sizes have inappropriate values
        // showMaxTopTags: Set this variable to the maximum number of results to be displayed in geographies and categories tag clouds
        // displaySharingAttribute: If set to true, display sharing attributes ("ALL", "GRP" or "ORG").
        //                          If set to false, sharing attributes ("ALL", "GRP" or "ORG") should not be displayed in item thumbnail
        // useItemPage: If set to true then display Item Info Page
        //              If set to false and item is of type webmap then load the Item
        //              If set to false and item is of type other than webmap then download the Item
        // portalURL: Set the portal URL
        // geometryService: Set the URL for geometry service

        ApplicationSettings: {
            group: "801cffe54b004008a8c316469c1e8326",
            theme: "",
            showCategoriesTagCloud: true,
            showGeographiesTagCloud: true,
            geographiesTagText: "arcgis.",
            geographiesPrefixText: "arcgis.",
            enableAutoComplete: true,
            tagCloudFontRange: {
                minValue: 15,
                maxValue: 20,
                units: "px"
            },
            showMaxTopTags: 10,
            displaySharingAttribute: false,
            useItemPage: false,
            portalURL: "http://www.arcgis.com",
            geometryService: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
        },

        //  groupDescription:  Displayed on the left panel of the index page. Defaults to group description.
        //  mapTitle: If not specified, the ArcGIS.com map's title is used.
        //  mapSnippet: If not specified, the ArcGIS.com web map's summary is used
        //  mapItemDescription: Displayed on item details page. Defaults to map description.
        //  mapLicenseInfo: Displayed on item details page. Defaults to map licenseInfo.
        //  defaultLayout: Default layout to use. "grid" or "list".
        //  sortField: Order to display the group items. Valid fields are:  modified, numViews.
        //  sortOrder: Order to sort the group: "asc" or "desc".
        //  mapViewer: URL to open the gallery items to. "simple","arcgis".
        //  searchString: Performs a default search on the group with the set string.
        //  searchType: Performs a default search on the group for the specified item type. Valid fields are valid item types, eg. web map, feature service, map service, etc.
        //  showBasemapGallery: Show basemap gallery on map: true or false.
        //  showMapSearch: Show textbox for address search on map: true or false
        //  showOverviewMap: Show overview on map: true or false.
        //  showMoreInfo: Show more info link on item details page: true or false.
        //  showRatings: Show ratings of items on item details page.
        //  showViews: Show ratings of items on item details page.
        //  showLicenseInfo: Show Use Constraints on item details page.
        //  showAttribution: Show sources on item details page.
        //  showComments: Show comments on item details page.

        AGOLItemSettings: {
            groupDescription: "",
            mapTitle: "",
            mapSnippet: "",
            mapItemDescription: "",
            mapLicenseInfo: "",
            defaultLayout: "list",
            sortField: "numViews",
            sortOrder: "desc",
            mapViewer: "",
            searchString: "",
            searchType: "",
            showBasemapGallery: true,
            showMapSearch: true,
            showOverviewMap: false,
            showMoreInfo: true,
            showRatings: true,
            showViews: true,
            showLicenseInfo: true,
            showAttribution: false,
            showComments: true
        },

        //------------------------------------------------------------------------------------------------------------------------
        // Header Widget Settings
        //------------------------------------------------------------------------------------------------------------------------
        // Set widgets settings such as widget title, widgetPath to be displayed in header panel
        // Title: Name of the widget, will displayed as title of widget in header panel
        // WidgetPath: path of the widget respective to the widgets package.

        AppHeaderWidgets: [{
            Title: "Settings",
            WidgetPath: "widgets/settings/settings"
        }, {
            Title: "Item Search",
            WidgetPath: "widgets/locator/locator"
        }, {
            Title: "Info",
            WidgetPath: "widgets/info/info"
        }, {
            Title: "Sort By",
            WidgetPath: "widgets/sortby/sortby"
        }, {
            Title: "Layout",
            WidgetPath: "widgets/layout/layout"
        }, {
            Title: "Sign In",
            WidgetPath: "widgets/portalSignin/portalSignin"
        }],

        // ------------------------------------------------------------------------------------------------------------------------
        // BASEMAP SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------
        // Set baseMap layers
        // Please note: All base-maps need to use the same spatial reference. By default, the first base-map will be loaded

        BaseMapLayers: [{
            Key: "topo",
            ThumbnailSource: "themes/images/Topographic.jpg",
            Name: "Topographic Map",
            MapURL: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"
        }, {
            Key: "streets",
            ThumbnailSource: "themes/images/streets.png",
            Name: "Street Map",
            MapURL: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
        }, {
            Key: "imagery",
            ThumbnailSource: "themes/images/imagery.png",
            Name: "Imagery Map",
            MapURL: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
        }],

        // ------------------------------------------------------------------------------------------------------------------------
        // ADDRESS SEARCH SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------
        // Set locator settings such as locator symbol, size, display fields, match score
        // DefaultLocatorSymbol: Set the image path for locator symbol. e.g. pushpin.
        // MarkupSymbolSize: Set the image dimensions in pixels for locator symbol.
        // LocatorDefaultAddress: Set the default address to search.
        // LocatorParameters: Required parameters to search the address candidates.
        //   SearchField: The name of geocode service input field that accepts the search address. e.g. 'SingleLine' or 'Address'.
        //   SearchBoundaryField: The name of geocode service input field that accepts an extent to search an input address within. e.g."searchExtent".
        // LocatorURL: Specify URL for geocode service.
        // LocatorOutFields: The list of outfields to be included in the result set provided by geocode service.
        // DisplayField: Specify the outfield of geocode service. The value in this field will be displayed for search results in the application.
        // AddressMatchScore: Required parameters to specify the accuracy of address match.
        //   Field: Set the outfield of geocode service that contains the Address Match Score.
        //   Value: Set the minimum score value for filtering the candidate results. The value should a number between 0-100.
        // FilterFieldName,FilterFieldValues: Candidates based on which the address search will be performed.
        //   FilterFieldName: Set the outfield that contains the match level for geocode request. e.g. For World GeoCode, the field that contains the match level is 'Addr_type'.
        //   FilterFieldValues: Specify the desired match levels to filter address search results. e.g. 'StreetAddress', 'StreetName' etc.

        LocatorSettings: {
            DefaultLocatorSymbol: "/themes/images/redpushpin.png",
            MarkupSymbolSize: {
                width: 35,
                height: 35
            },
            ZoomLevel: 12,
            LocatorDefaultAddress: "Lake Echo Rd Tracy City TN 37387",
            LocatorParameters: {
                SearchField: "SingleLine",
                SearchBoundaryField: "searchExtent"
            },
            LocatorURL: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
            LocatorOutFields: ["Addr_Type", "Type", "Score", "Match_Addr", "xmin", "xmax", "ymin", "ymax"],
            DisplayField: "${Match_Addr}",
            AddressMatchScore: {
                Field: "Score",
                Value: 80
            },
            FilterFieldName: 'Addr_Type',
            FilterFieldValues: ["StreetAddress", "StreetName", "PointAddress", "POI"]
        }
    }
});