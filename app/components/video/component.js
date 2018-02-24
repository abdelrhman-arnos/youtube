'use strict';

angular.module('myApp.video', [])

    .controller('videoCtrl', ['$scope', '$stateParams', 'gapiService', '$timeout', 'cfpLoadingBar',
        function ($scope, $stateParams, gapiService, $timeout, cfpLoadingBar) {

            // Get video id from state.
            $scope.videoId = $stateParams.id;
            // Get playlist id from state.
            $scope.playlistId = $stateParams.list;
            // data used to push all data into it.
            $scope.data = [];
            // videos used for related videos.
            $scope.data.videos = [];
            // playlistItems used to push the videos ids from playlist id.
            $scope.data.playlistItems = [];
            // playlistVideos used for videos in playlist.
            $scope.data.playlistVideos = [];
            // videosIds used to push related videos.
            $scope.videosIds = [];
            // Checker to push to playlist videos.
            let plCond = false;

            gapiService.createResource();
            gapiService.removeEmptyParams();

            function executeRequest(request) {
                request.execute(response => {
                    let type = response.items[0].kind.split('youtube#')[1];
                    switch (type) {
                        case 'video':
                            if(!$scope.data.video){
                                if($scope.playlistId){
                                    playlists($scope.playlistId);
                                    PlaylistItems($scope.playlistId);
                                }
                                $scope.data.video = response.items[0];
                                response.items.forEach(item => {
                                    channelItems(item.snippet.channelId);
                                    searchRelated(item.id);
                                });
                            } else if(plCond){
                                response.items.forEach(item => {
                                    $scope.data.playlistVideos.push(item);
                                });
                                plCond = false;
                            }else{
                                response.items.forEach(item => {
                                    $scope.data.videos.push(item);
                                });
                            }
                            break;
                        case 'playlistItem':
                            response.items.forEach(item => {
                                // Add video id to use in append videos.
                                $scope.data.playlistItems.push(item.contentDetails.videoId);
                            });
                            videoItems($scope.data.playlistItems);
                            plCond = true;
                            break;
                        case 'channel':
                            $scope.data.channel = response.items[0];
                            break;
                        case 'playlist':
                            $scope.data.playlist = response.items[0];
                            break;
                        case 'searchResult':
                            response.items.forEach(item => {
                                $scope.videosIds.push(item.id.videoId);
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
                        'maxResults': 25,
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

            function searchRelated(...id) {
                if (id[0].length === 0) return false;
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/search',
                    {
                        'relatedToVideoId': id,
                        'type': 'video',
                        'maxResults': 10,
                        'part': 'snippet',
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
            videoItems($scope.videoId);

            $scope.likePercentage = function (likeCount, dislikeCount) {
                return `width:${Math.round((likeCount - dislikeCount) / likeCount * 100)}%`;
            };

        }]);