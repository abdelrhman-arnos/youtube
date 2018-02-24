'use strict';

angular.module('myApp.channel', [])

    .controller('channelCtrl', ['$scope', '$stateParams', 'gapiService', '$timeout', 'cfpLoadingBar',
        function ($scope, $stateParams, gapiService, $timeout, cfpLoadingBar) {
            $scope.channelId = $stateParams.id;
            $scope.channel = [];
            $scope.channel.videos = [];
            $scope.playlistsIds = [];
            $scope.videosIds = [];

            gapiService.createResource();
            gapiService.removeEmptyParams();

            function executeRequest(request) {
                request.execute(response => {
                    let type = response.items[0].kind.split('youtube#')[1];
                    switch (type) {
                        case 'video':
                            response.items.forEach(item=>{
                                $scope.channel.videos.push(item);
                            });
                            break;
                        case 'playlistItem':
                            response.items.forEach(item=>{
                                $scope.videosIds.push(item.contentDetails.videoId);
                            });
                            videoItems($scope.videosIds);
                            $scope.videosIds = [];
                            break;
                        case 'channel':
                            channelSections(response.items[0].id);
                            $scope.channel.push(response.items[0]);
                            break;
                        case 'channelSection':
                            response.items.forEach(item=>{
                                if(item.snippet.type==='singlePlaylist'){
                                    $scope.playlistsIds.push(item.contentDetails.playlists[0]);
                                }
                            });
                            PlaylistItems($scope.playlistsIds);
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
                        'maxResults': 10,
                        'part': 'contentDetails',
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

            function channelSections(id) {
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/channelSections',
                    {
                        'channelId': id,
                        'part': 'snippet,contentDetails',
                        'key': gapiService.apiKey
                    }
                ));
            }

            executeRequest(gapiService.buildApiRequest('GET',
                '/youtube/v3/channels',
                {
                    'id': $scope.channelId,
                    'maxResults': 1,
                    'part': 'snippet,statistics,brandingSettings',
                    'key': gapiService.apiKey
                }
            ));

        }]);