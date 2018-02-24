'use strict';

angular.module('myApp', [
    'angular-loading-bar',
    'ngAnimate',
    'ui.router',
    'myApp.channel',
    'myApp.search',
    'myApp.video'
])

    .config(['$locationProvider', '$stateProvider', '$urlRouterProvider', 'cfpLoadingBarProvider',
        function ($locationProvider, $stateProvider, $urlRouterProvider, cfpLoadingBarProvider) {
            $locationProvider.html5Mode(true).hashPrefix('!');
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
                    url: '/video/:id?list',
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

    .controller('appCtrl', ['$scope', '$stateParams', '$location', '$timeout', 'cfpLoadingBar',
        function ($scope, $stateParams, $location, $timeout, cfpLoadingBar) {

        // fake the initial load so first time users can see it right away:
        cfpLoadingBar.start();
        $timeout(()=>{ cfpLoadingBar.complete(); }, 750);

        $scope.getSearch = () => {
            if (!$scope.search_value) return false;
            if($scope.search_value !== $stateParams.query) $scope.searchMob = false;
            $location.url(`/search?query=${$scope.search_value}`);
        };

    }]);

