'use strict';

angular.module('myApp')

    /***** CONVERT NUMBER: Convert the number to abbreviation ex: => 34.57k *****/
    .filter('convNum', function(){
        return function (number, decPlaces) {
            // 2 decimal places => 100, 3 => 1000, etc
            decPlaces = Math.pow(10, decPlaces);

            // Enumerate number abbreviations
            var abbrev = ["K", "M", "B", "T"];

            // Go through the array backwards, so we do the largest first
            for (var i = abbrev.length - 1; i >= 0; i--) {

                // Convert array index to "1000", "1000000", etc
                var size = Math.pow(10, (i + 1) * 3);

                // If the number is bigger or equal do the abbreviation
                if (size <= number) {
                    // Here, we multiply by decPlaces, round, and then divide by decPlaces.
                    // This gives us nice rounding to a particular decimal place.
                    number = Math.round(number * decPlaces / size) / decPlaces;

                    // Handle special case where we round up to the next abbreviation
                    if ((number == 1000) && (i < abbrev.length - 1)) {
                        number = 1;
                        i++;
                    }

                    // Add the letter for the abbreviation
                    number += abbrev[i];

                    // We are done... stop
                    break;
                }
            }
            return number;
        }
    })

    /***** CUT TEXT: Return the text with a certain number of characters *****/
    /**
     * Wordwise (boolean) - if true, cut only by words bounds,
     * Max (integer) - max length of the text, cut to this number of chars,
     * Tail (string, default: ' …') - add this string to the input string if the string was cut.
     */
    .filter('cut', function(){
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace !== -1) {
                    //Also remove . and , so its gives a cleaner result.
                    if (value.charAt(lastspace - 1) === '.' || value.charAt(lastspace - 1) === ',') {
                        lastspace = lastspace - 1;
                    }
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    })

    /***** Convert time to short HH:MM:SS ex: 1:25:47 *****/
    .filter('duration', function (){
        return function(duration){
            function convert_time(durationStr) {
                let total = 0;
                let hours = durationStr.match(/(\d+)H/);
                let minutes = durationStr.match(/(\d+)M/);
                let seconds = durationStr.match(/(\d+)S/);
                if (hours) total += parseInt(hours[1]) * 3600;
                if (minutes) total += parseInt(minutes[1]) * 60;
                if (seconds) total += parseInt(seconds[1]);
                return total;
            }
            function secondsToHms(durationSec) {
                durationSec = Number(durationSec);
                let h = Math.floor(durationSec / 3600);
                let m = Math.floor(durationSec % 3600 / 60);
                let s = Math.floor(durationSec % 3600 % 60);
                let hDisplay = h > 0 ? h + (h == 1 ? ":" : ":") : "";
                let mDisplay = m > 0 ? m + (m == 1 ? ":" : ":") : "";
                let sDisplay = s > 0 ? s + (s == 1 ? "" : "") : "";
                return hDisplay + mDisplay + sDisplay;
            }
            return secondsToHms(convert_time(duration));
        };
    })

    /***** Inject video id to embed url *****/
    .filter('youtubeEmbedUrl', function($sce){
        return function(videoId) {
            return $sce.trustAsResourceUrl(`http://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
        };
    })

    /***** Format date with *** time age statement *****/
    /**
     * just now
     * 12 seconds ago
     * 3 minutes ago
     * 2 hours ago
     * 3 days ago
     * 3 weeks ago
     * 6 months ago
     * 2 years ago
     */
    .filter('timeago', function(){
        return function(time){
            return timeago().format(time);
        };
    });