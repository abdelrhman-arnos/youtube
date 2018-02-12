'use strict';

angular.module('myApp.search', ['angular-loading-bar'])

    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeBar = true;
    }])

    .controller('searchCtrl', ['$scope', '$rootScope', '$stateParams', 'gapiService', '$location', '$timeout', 'cfpLoadingBar',
        function ($scope, $rootScope, $stateParams, gapiService, $location, $timeout, cfpLoadingBar) {
            $scope.start = () => {
                cfpLoadingBar.start();
            };
            $scope.complete = () => {
                cfpLoadingBar.complete();
            };
            $scope.resultTypes = [];
            $scope.search = [];
            $scope.videos = [];
            $scope.channels = [];
            $scope.playlists = [];
            $scope.playlistItems = [];

            gapiService.createResource();
            gapiService.removeEmptyParams();

            function executeRequest(request) {
                request.execute(function (response) {
                    cfpLoadingBar.start();
                    let type = response.items[0].kind.split('youtube#')[1];
                    if (type === 'searchResult') {
                        response.items.forEach(item => searchItems(item));
                        $scope.search = response;
                    }
                    switch (type) {
                        case 'video':
                            $scope.resultTypes.push(type);
                            $scope.videos.push(response.items[0]);
                            break;
                        case 'channel':
                            $scope.resultTypes.push(type);
                            $scope.channels.push(response.items[0]);
                            break;
                        case 'playlist':
                            $scope.resultTypes.push(type);
                            PlaylistItems(response.items[0].id);
                            $scope.playlists.push(response.items[0]);
                            break;
                        case 'playlistItem':
                            $scope.playlistItems.push(...response.items);
                            break;
                    }
                    $timeout(() => {
                        $scope.complete();
                    }, 500);
                });
            }

            function PlaylistItems(id) {
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/playlistItems',
                    {
                        'playlistId': id,
                        'maxResults': 2,
                        'part': 'snippet,contentDetails',
                        'key': gapiService.apiKey
                    }
                ));
            }

            function playlists(id) {
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/playlists',
                    {
                        'id': id,
                        'part': 'snippet,contentDetails',
                        'key': gapiService.apiKey
                    }
                ));
            }

            function videoItems(id) {
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/videos',
                    {
                        'id': id,
                        'part': 'snippet,contentDetails,statistics,liveStreamingDetails',
                        'key': gapiService.apiKey
                    }
                ));
            }

            function channelItems(id) {
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/channels',
                    {
                        'id': id,
                        'part': 'snippet,statistics',
                        'key': gapiService.apiKey
                    }
                ));
            }

            function searchItems(item) {
                let type = item.id.kind.split('youtube#')[1];
                let id = item.id[`${type}Id`];
                switch (type) {
                    case 'video':
                        videoItems(id);
                        break;
                    case 'channel':
                        channelItems(id);
                        break;
                    case 'playlist':
                        playlists(id);
                        break;
                }
            }

            function uploadDate(filterType) {
                let ISODate = '';
                let today = new Date();
                let lasthour = new Date(today.getTime() - (1000 * 60 * 60));
                let thismonth = new Date(`${new Date().getFullYear()}-${today.getMonth()}-01`);
                let thisyear = new Date(`${today.getFullYear()}-01-01`);

                switch (filterType) {
                    case 'tt':
                        ISODate = '';
                        break;
                    case 'lh':
                        ISODate = lasthour.toISOString();
                        break;
                    case 'tm':
                        ISODate = thismonth.toISOString();
                        break;
                    case 'ty':
                        ISODate = thisyear.toISOString();
                        break;
                }
                return ISODate;
            }

            // Filters
            $scope.filter = false;
            $scope.query = $stateParams.query; // Get query param
            $scope.date = $stateParams.date; // Get date param
            $scope.upDate = uploadDate($stateParams.date); // Send ISO date to API
            $scope.type = $stateParams.type; // Get type param
            $scope.sort = $stateParams.sort; // Get sort param
            if ($scope.date || $scope.type) $scope.filter = true;

            $scope.searchList = function(pageToken) {
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/search',
                    {
                        'q': $scope.query,
                        'part': 'snippet',
                        'maxResults': 5,
                        'publishedAfter': $scope.upDate,
                        'order': $scope.sort,
                        'type': $scope.type,
                        'key': gapiService.apiKey,
                        'pageToken': pageToken
                    }
                ));
            };

            $scope.searchList();
        }])

    .directive('videoRender', [function () {
        return {
            restrict: 'E',
            scope: {
                videos: '=',
                getVid: '='
            },
            templateUrl: 'views/video-render.html',
            controller: function ($scope) {
                //
            }
        };
    }])

    .directive('channelRender', [function () {
        return {
            restrict: 'E',
            scope: {
                channels: '=',
            },
            templateUrl: 'views/channel-render.html',
            controller: function ($scope) {
                //
            }
        };
    }])

    .directive('playlistRender', [function () {
        return {
            restrict: 'E',
            scope: {
                playlists: '=',
                playlistItems: '=',
            },
            templateUrl: 'views/playlist-render.html',
            controller: function ($scope) {
                //
            }
        };
    }])

    // Directive to catch the height page when scrolling
    .directive("scroll", ['$window', '$timeout', function ($window, $timeout) {
        return {
            scope: {
                search: '=',
                searchList: '&'
            },
            link: function (scope) {
                angular.element($window).bind("scroll", function () {
                    let windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
                    let body = document.body, html = document.documentElement;
                    let docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                    let windowBottom = windowHeight + window.pageYOffset;
                    if (windowBottom >= docHeight) {
                        document.getElementById('spinner').style.opacity = 1;
                        $timeout(() => {
                            scope.searchList();
                        }, 500);
                    }
                });
            }
        };
    }]);