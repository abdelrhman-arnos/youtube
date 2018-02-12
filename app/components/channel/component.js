'use strict';

angular.module('myApp.channel', [])

    .controller('channelCtrl', ['$scope', '$stateParams', 'gapiService',
        function ($scope, $stateParams, gapiService) {
            $scope.channelId = $stateParams.id;
            $scope.video = [];
            $scope.channel = [];
            $scope.playlists = [];

            gapiService.createResource();
            gapiService.removeEmptyParams();

            function executeRequest(request) {
                request.execute(response => {
                    let type = response.items[0].kind.split('youtube#')[1];
                    $scope.$apply(() => {
                        switch (type) {
                            case 'video':
                                $scope.video.push(response.items[0]);
                                break;
                            case 'channel':
                                playlists(response.items[0].id);
                                $scope.channel.push(response.items[0]);
                                break;
                            case 'playlist':
                                PlaylistItems(response.items[0].id);
                                $scope.playlists.push(response.items[0]);
                                break;
                            case 'playlistItem':
                                response.items.forEach((plItem, i) => {
                                    $scope.playlists.forEach((item, index) => {
                                        if (item.id == plItem.snippet.playlistId) {
                                            //
                                        }

                                    });
                                });
                                break;
                        }
                    });
                });
            }

            function PlaylistItems(id) {
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/playlistItems',
                    {
                        'playlistId': id,
                        'part': 'snippet,contentDetails',
                        'maxResults': 2,
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

            /*function playlistItems(id) {
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/playlists',
                    {
                        'id': id,
                        'part': 'snippet,contentDetails',
                        'key': gapiService.apiKey
                    }
                ));
            }*/

            function playlists(id) {
                executeRequest(gapiService.buildApiRequest('GET',
                    '/youtube/v3/playlists',
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