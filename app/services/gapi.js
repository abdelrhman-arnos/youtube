'use strict';

angular.module('myApp')

    .service('gapiService', function () {

        this.apiKey = 'AIzaSyBEAOIamWYLWCg0LuDQ1EAbpjHX_7n9LxA';

        this.createResource = properties => {
            var resource = {};
            var normalizedProps = properties;
            for (var p in properties) {
                var value = properties[p];
                if (p && p.substr(-2, 2) == '[]') {
                    var adjustedName = p.replace('[]', '');
                    if (value) {
                        normalizedProps[adjustedName] = value.split(',');
                    }
                    delete normalizedProps[p];
                }
            }
            for (var p in normalizedProps) {
                // Leave properties that don't have values out of inserted resource.
                if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
                    var propArray = p.split('.');
                    var ref = resource;
                    for (var pa = 0; pa < propArray.length; pa++) {
                        var key = propArray[pa];
                        if (pa == propArray.length - 1) {
                            ref[key] = normalizedProps[p];
                        } else {
                            ref = ref[key] = ref[key] || {};
                        }
                    }
                }
            }
            return resource;
        };

        this.removeEmptyParams = params => {
            for (var p in params) {
                if (!params[p] || params[p] == 'undefined') {
                    delete params[p];
                }
            }
            return params;
        };

        this.buildApiRequest = (requestMethod, path, params, properties) => {
            params = this.removeEmptyParams(params);
            let request;
            if (properties) {
                let resource = this.createResource(properties);
                request = gapi.client.request({
                    'body': resource,
                    'method': requestMethod,
                    'path': path,
                    'params': params
                });
            } else {
                request = gapi.client.request({
                    'method': requestMethod,
                    'path': path,
                    'params': params
                });
            }
            return request;
        };

    });