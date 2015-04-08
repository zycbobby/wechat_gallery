'use strict';

angular.module('wechatGalleryClientApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  })
  .run(function($rootScope, $window) {
    $rootScope.async = $window.async;
    $rootScope.jsPDF = $window.jsPDF;
  });
