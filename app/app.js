'use strict';

angular.module('myApp', [
    'angular-loading-bar',
    'ngAnimate',
    'ui.router',
    'myApp.channel',
    'myApp.search',
    'myApp.video',
])

    .config(['$stateProvider', '$urlRouterProvider', 'cfpLoadingBarProvider',
        function ($stateProvider, $urlRouterProvider, cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
            $stateProvider
                .state('root', {
                    url: '/',
                    template: '<h1 style="text-align:center">Welcome to Youtube app!</h1>',
                    controller: 'appCtrl'
                })
                .state('channel', {
                    url: '/channel/:id',
                    templateUrl: 'views/channel.html',
                    controller: 'channelCtrl'
                })
                .state('video', {
                    url: '/video/:id',
                    templateUrl: 'views/video.html',
                    controller: 'videoCtrl'
                })
                .state('search', {
                    url: '/search?query&date&type&sort',
                    templateUrl: 'views/search.html',
                    controller: 'searchCtrl'
                })
            ;

            $urlRouterProvider.otherwise('/');
        }])

    .controller('appCtrl', ['$scope', '$location', '$timeout', 'cfpLoadingBar', function ($scope, $location, $timeout, cfpLoadingBar) {
        $scope.start = ()=>{ cfpLoadingBar.start(); };
        $scope.complete = ()=>{ cfpLoadingBar.complete(); };

        // fake the initial load so first time users can see it right away:
        $scope.start();
        $timeout(()=>{ $scope.complete(); }, 750);

        $scope.getSearch = () => {
            if (!$scope.search_value) return false;
            $location.url(`/search?query=${$scope.search_value}`);
        };
    }]);

