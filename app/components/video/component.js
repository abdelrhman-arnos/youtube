'use strict';

angular.module('myApp.video', [])

    .controller('videoCtrl', ['$scope', '$stateParams', 'gapiService',
        function ($scope, $stateParams, gapiService) {
            $scope.videoId = $stateParams.id;
            $scope.video = [];
            $scope.channel = [];

            gapiService.createResource();
            gapiService.removeEmptyParams();

            function executeRequest(request) {
                request.execute(response => {
                    let type = response.items[0].kind.split('youtube#')[1];
                    $scope.$apply(() => {
                        switch (type) {
                            case 'video':
                                channelItems(response.items[0].snippet.channelId);
                                $scope.video.push(response.items[0]);
                                break;
                            case 'channel':
                                $scope.channel.push(response.items[0]);
                                break;
                        }
                    });
                });
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

            executeRequest(gapiService.buildApiRequest('GET',
                '/youtube/v3/videos',
                {
                    'id': $scope.videoId,
                    'part': 'snippet,contentDetails,statistics,liveStreamingDetails',
                    'key': gapiService.apiKey
                }
            ));

            $scope.likePercentage = function (likeCount, dislikeCount) {
                return `width:${Math.round((likeCount - dislikeCount) / likeCount * 100)}%`;
            };

        }]);