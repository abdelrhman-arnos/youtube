'use strict';

angular.module('myApp.search', ['angular-loading-bar'])

    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeBar = true;
    }])

    .controller('searchCtrl', ['$scope', '$stateParams', 'filterDate', 'gapiService', '$location', '$timeout', 'cfpLoadingBar',
        function ($scope, $stateParams, filterDate, gapiService, $location, $timeout, cfpLoadingBar) {
            $scope.search = [];
            $scope.search.items = [];
            $scope.videosIds = [];

            gapiService.createResource();
            gapiService.removeEmptyParams();

            function executeRequest(request) {
                request.execute(function (response) {
                    cfpLoadingBar.start();
                    let type = response.items[0].kind.split('youtube#')[1];
                    if (type === 'searchResult') {
                        searchItems(response.items);
                        $scope.search.items.push(...response.items);
                        $scope.search.totalResults = response.pageInfo.totalResults;
                        $scope.search.nextPageToken = response.nextPageToken;
                    }
                    $scope.search.items.forEach(searchElement => {
                        response.items.forEach(element => {
                            if (searchElement.id[`${type}Id`] === element.id) {
                                searchElement.data = element;
                                searchElement.data.videos = [];
                                searchElement.playlistItems = [];
                            }
                        });
                    });
                    switch (type) {
                        case 'video':
                            if ($stateParams.type === 'playlist') {
                                response.items.forEach(resElm => {
                                    $scope.search.items.find(elm => {
                                        for (let i = 0; i < elm.playlistItems.length; i++) {
                                            if (elm.playlistItems[i] === resElm.id) {
                                                elm.data.videos.push(resElm);
                                            }
                                        }
                                    });
                                });
                            }
                            break;
                        case 'playlist':
                            response.items.forEach(item => {
                                PlaylistItems(item.id);
                            });
                            break;
                        case 'playlistItem':
                            response.items.forEach(vid => {
                                // Use this array to call video API ones.
                                $scope.videosIds.push(vid.contentDetails.videoId);
                                $scope.search.items.find(elm => {
                                    if (vid.snippet.playlistId === elm.data.id) {
                                        // Add video id to use in append videos.
                                        elm.playlistItems.push(vid.contentDetails.videoId);
                                    }
                                });
                            });
                            videoItems($scope.videosIds);
                            $scope.videosIds = [];
                            break;
                    }
                    $timeout(() => {
                        cfpLoadingBar.complete();
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

            function playlists(...id) {
                if (id[0].length === 0) return false;
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/playlists',
                    {
                        'id': id,
                        'part': 'snippet,contentDetails',
                        'key': gapiService.apiKey
                    }
                ));
            }

            function videoItems(...id) {
                if (id[0].length === 0) return false;
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/videos',
                    {
                        'id': id,
                        'part': 'snippet,contentDetails,statistics,liveStreamingDetails,status',
                        'key': gapiService.apiKey
                    }
                ));
            }

            function channelItems(...id) {
                if (id[0].length === 0) return false;
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/channels',
                    {
                        'id': id,
                        'part': 'snippet,statistics',
                        'key': gapiService.apiKey
                    }
                ));
            }

            function searchItems(items) {
                let arr = [];
                arr.video = [];
                arr.channel = [];
                arr.playlist = [];
                items.forEach(sResult => {
                    let type = sResult.id.kind.split('youtube#')[1];
                    let id = sResult.id[`${type}Id`];
                    arr[type].push(id);
                });
                videoItems(arr.video);
                channelItems(arr.channel);
                playlists(arr.playlist);
            }

            // Filters
            $scope.filter = false;
            // Get query param
            $scope.query = $stateParams.query;
            // Get date param
            $scope.date = $stateParams.date;
            // Send ISO date to API
            $scope.upDate = filterDate.uploadDate($stateParams.date);
            // Get type param
            $scope.type = $stateParams.type;
            // Get sort param
            $scope.sort = $stateParams.sort;
            if ($scope.date || $scope.type) $scope.filter = true;

            $scope.searchList = function (pageToken) {
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/search',
                    {
                        'q': $scope.query,
                        'part': 'snippet',
                        'maxResults': 10,
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
                item: '='
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
                item: '=',
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
                item: '='
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
                searchList: '&',
            },
            link: function (scope) {
                angular.element($window).bind("scroll", function () {
                    if (document.getElementById('spinner')) {
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
                    }
                });
            }
        };
    }]);