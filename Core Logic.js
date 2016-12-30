(function () {

    var app = {};

    var listA, listB;

    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

    document.getElementById("debug").addEventListener("click", function(event){
        event.preventDefault();
        listA = document.getElementById('2015').innerText;
        listB = document.getElementById('2016').innerText;
        app.comparePlaylists(listA, listB);
    });

    document.getElementById("mainSubmit").addEventListener("click", function(event){
        event.preventDefault();
        // @todo: Get the form values and pass them to app.comparePlaylists()
    });

    /*****************************************************************************
     *
     * Helper functions
     *
     ****************************************************************************/

    /**
     * Array chunk dat shit
     * @link http://www.frontcoded.com/splitting-javascript-array-into-chunks.html
     * @param arr
     * @param chunkSize
     * @returns {Array}
     */
    var createGroupedArray = function(arr, chunkSize) {
        var groups = [], i;
        for (i = 0; i < arr.length; i += chunkSize) {
            groups.push(arr.slice(i, i + chunkSize));
        }
        return groups;
    };

    /*****************************************************************************
     *
     * Main Methods
     *
     ****************************************************************************/

    /**
     * @todo validate spotify URL via regex and extract track ids
     * @param list
     */
    app.validateList = function (list) {

    };

    app.comparePlaylists = function (listA, listB) {

        var spotifyApi = new SpotifyWebApi();
        var separator = " "; // TODO be prepared this may change

        listA = listA.split(separator);
        listB = listB.split(separator);

        var results = [];
        var trackIds  = [];

        var match, shift;
        for (var i = 0; i < listB.length; i++) { //Newer List
            match = shift = 0;
            trackIds[i] = listB[i].substr(31,22); //@todo move to a separate method

            for (var j = 0; j < listA.length; j++) {

                if (listB[i] === listA[j]) {
                    // We have a match, work out the shift
                    match = 1;
                    shift = j - i;
                    break;
                }
            }
            //if (i > 20) break; // debug

            results[i] = match ? shift : 'New';
        }

        // The api can handle a max of 50, split the requests evenlyish
        var chunkedArray = createGroupedArray(trackIds, 36);
        var trackList = [];
        var tracks = [];


        // @todo, need to return ordered tracks, map() has potential
        var test = chunkedArray.map(function(tracks) {

            /*spotifyApi.getTracks(tracks, function (err, data) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Tracks', data.tracks);
                    /!*trackList.push(data);
                     //trackList[i] = data.tracks;
                     console.log('TrackList', trackList);*!/
                }
                return data.tracks;
            });*/
        });


        // Now lets assume we have an ordered array of tracks
        /**
         * @todo loop through array of ordered tracks and update the tables, currently just do the first
         *
         */

        // Mocked response
        var comparedListB = [
            { // Tom Misch - The Journey
                album : {
                    album_type : "album",
                    artists : [ {
                        external_urls : {
                            spotify : "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
                        },
                        href : "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
                        id : "0C0XlULifJtAgn6ZNCW2eu",
                        name : "Tom Misch",
                        type : "artist",
                        uri : "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
                    } ],
                    available_markets : [ "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MY", "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "SE", "SG", "SK", "SV", "TR", "TW", "UY" ],
                    external_urls : {
                        spotify : "https://open.spotify.com/album/4OHNH3sDzIxnmUADXzv2kT"
                    },
                    href : "https://api.spotify.com/v1/albums/4OHNH3sDzIxnmUADXzv2kT",
                    id : "4OHNH3sDzIxnmUADXzv2kT",
                    images : [ {
                        height : 640,
                        url : "https://i.scdn.co/image/ac68a9e4a867ec3ce8249cd90a2d7c73755fb487",
                        width : 629
                    }, {
                        height : 300,
                        url : "https://i.scdn.co/image/d0186ad64df7d6fc5f65c20c7d16f4279ffeb815",
                        width : 295
                    }, {
                        height : 64,
                        url : "https://i.scdn.co/image/7c3ec33d478f5f517eeb5339c2f75f150e4d601e",
                        width : 63
                    } ],
                    name : "Beat Tape 2",
                    type : "album",
                    uri : "spotify:album:4OHNH3sDzIxnmUADXzv2kT"
                },
                artists : [ {
                    external_urls : {
                        spotify : "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
                    },
                    href : "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
                    id : "0C0XlULifJtAgn6ZNCW2eu",
                    name : "Tom Misch",
                    type : "artist",
                    uri : "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
                } ],
                available_markets : [ "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MY", "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "SE", "SG", "SK", "SV", "TR", "TW", "UY" ],
                disc_number : 1,
                duration_ms : 222200,
                explicit : false,
                external_ids : {isrc : "GBFFP0300052"
                },
                external_urls : {
                    spotify : "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
                },
                href : "https://api.spotify.com/v1/tracks/3n3Ppam7vgaVa1iaRUc9Lp",
                id : "3n3Ppam7vgaVa1iaRUc9Lp",
                name : "The Journey",
                popularity : 73,
                preview_url : "https://p.scdn.co/mp3-preview/4839b070015ab7d6de9fec1756e1f3096d908fba",
                track_number : 2,
                type : "track",
                uri : "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
            },
            { // Panacea - Greyboy
                album : {
                    album_type : "album",
                    artists : [ {
                        external_urls : {
                            spotify : "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
                        },
                        href : "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
                        id : "0C0XlULifJtAgn6ZNCW2eu",
                        name : "Greyboy",
                        type : "artist",
                        uri : "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
                    } ],
                    available_markets : [ "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MY", "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "SE", "SG", "SK", "SV", "TR", "TW", "UY" ],
                    external_urls : {
                        spotify : "https://open.spotify.com/album/4OHNH3sDzIxnmUADXzv2kT"
                    },
                    href : "https://api.spotify.com/v1/albums/4OHNH3sDzIxnmUADXzv2kT",
                    id : "4OHNH3sDzIxnmUADXzv2kT",
                    images : [ {
                        height : 640,
                        url : "https://i.scdn.co/image/ac68a9e4a867ec3ce8249cd90a2d7c73755fb487",
                        width : 629
                    }, {
                        height : 300,
                        url : "https://i.scdn.co/image/d0186ad64df7d6fc5f65c20c7d16f4279ffeb815",
                        width : 295
                    }, {
                        height : 64,
                        url : "https://i.scdn.co/image/7c3ec33d478f5f517eeb5339c2f75f150e4d601e",
                        width : 63
                    } ],
                    name : "15 Years of West Coast Cool",
                    type : "album",
                    uri : "spotify:album:4OHNH3sDzIxnmUADXzv2kT"
                },
                artists : [ {
                    external_urls : {
                        spotify : "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
                    },
                    href : "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
                    id : "0C0XlULifJtAgn6ZNCW2eu",
                    name : "Greyboy",
                    type : "artist",
                    uri : "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
                } ],
                available_markets : [ "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MY", "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "SE", "SG", "SK", "SV", "TR", "TW", "UY" ],
                disc_number : 1,
                duration_ms : 222200,
                explicit : false,
                external_ids : {isrc : "GBFFP0300052"
                },
                external_urls : {
                    spotify : "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
                },
                href : "https://api.spotify.com/v1/tracks/3n3Ppam7vgaVa1iaRUc9Lp",
                id : "3n3Ppam7vgaVa1iaRUc9Lp",
                name : "Panacea",
                popularity : 73,
                preview_url : "https://p.scdn.co/mp3-preview/4839b070015ab7d6de9fec1756e1f3096d908fba",
                track_number : 2,
                type : "track",
                uri : "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
            },
            { // Shuggie Otis
                album : {
                    album_type : "album",
                    artists : [ {
                        external_urls : {
                            spotify : "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
                        },
                        href : "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
                        id : "0C0XlULifJtAgn6ZNCW2eu",
                        name : "Tom Misch",
                        type : "artist",
                        uri : "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
                    } ],
                    available_markets : [ "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MY", "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "SE", "SG", "SK", "SV", "TR", "TW", "UY" ],
                    external_urls : {
                        spotify : "https://open.spotify.com/album/4OHNH3sDzIxnmUADXzv2kT"
                    },
                    href : "https://api.spotify.com/v1/albums/4OHNH3sDzIxnmUADXzv2kT",
                    id : "4OHNH3sDzIxnmUADXzv2kT",
                    images : [ {
                        height : 640,
                        url : "https://i.scdn.co/image/ac68a9e4a867ec3ce8249cd90a2d7c73755fb487",
                        width : 629
                    }, {
                        height : 300,
                        url : "https://i.scdn.co/image/d0186ad64df7d6fc5f65c20c7d16f4279ffeb815",
                        width : 295
                    }, {
                        height : 64,
                        url : "https://i.scdn.co/image/7c3ec33d478f5f517eeb5339c2f75f150e4d601e",
                        width : 63
                    } ],
                    name : "Beat Tape 2",
                    type : "album",
                    uri : "spotify:album:4OHNH3sDzIxnmUADXzv2kT"
                },
                artists : [ {
                    external_urls : {
                        spotify : "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
                    },
                    href : "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
                    id : "0C0XlULifJtAgn6ZNCW2eu",
                    name : "Shuggie Otis",
                    type : "artist",
                    uri : "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
                } ],
                available_markets : [ "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MY", "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "SE", "SG", "SK", "SV", "TR", "TW", "UY" ],
                disc_number : 1,
                duration_ms : 222200,
                explicit : false,
                external_ids : {isrc : "GBFFP0300052"
                },
                external_urls : {
                    spotify : "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
                },
                href : "https://api.spotify.com/v1/tracks/3n3Ppam7vgaVa1iaRUc9Lp",
                id : "3n3Ppam7vgaVa1iaRUc9Lp",
                name : "Inspiration Information",
                popularity : 73,
                preview_url : "https://p.scdn.co/mp3-preview/4839b070015ab7d6de9fec1756e1f3096d908fba",
                track_number : 2,
                type : "track",
                uri : "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
            }
        ];

        var tableB = document.getElementById('tableB');
        // @todo, maybe do a check here for existing rows.

        // Define the columns
        // @todo, create entire table based upon metadata here
        var tableColumnNames = ['#', 'Song', 'Artist', '&Delta;'];
        var position = 0;
        for (i = 0; i < comparedListB.length; i++) {
            // Add row to table
            position = i + 1;
            var row = tableB.insertRow();
            row.insertCell(0).outerHTML = '<th scope="row">' + position.toString() + '</th>';
            row.insertCell(1).innerHTML = comparedListB[i].name;
            row.insertCell(2).innerHTML = comparedListB[i].artists[0].name;
            row.insertCell(3).innerHTML = 'DIFF'; //@todo must get this
        }


        /*for (i = 0; i < chunkedArray.length; i++) {
            // TOdo, how to get this back in order
             spotifyApi.getTracks(chunkedArray[i], function(err, data) {
             if (err) {
                 console.error(err);
             } else {
                 console.log('Tracks', data.tracks);
                 trackList.push(data);
                 //trackList[i] = data.tracks;
                 console.log('TrackList', trackList);
             }

             });

            //trackList[i] = spotifyApi.getTracks(chunkedArray[i]);
        }*/

        // ???
        /*for (i = 0; i < trackList.length; i++) {
            trackList[i].then(function(data) {
                //console.log('Artist albums', data);
                tracks = data;
            }, function(err) {
                console.error(err);
            })
        }*/



        console.log('TrackList', trackList);
        console.log('tracks', tracks);

    };

    // Example track response
    var track = {
        album : {
            album_type : "album",
            artists : [ {
                external_urls : {
                    spotify : "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
                },
                href : "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
                id : "0C0XlULifJtAgn6ZNCW2eu",
                name : "The Killers",
                type : "artist",
                uri : "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
            } ],
            available_markets : [ "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MY", "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "SE", "SG", "SK", "SV", "TR", "TW", "UY" ],
            external_urls : {
                spotify : "https://open.spotify.com/album/4OHNH3sDzIxnmUADXzv2kT"
            },
            href : "https://api.spotify.com/v1/albums/4OHNH3sDzIxnmUADXzv2kT",
            id : "4OHNH3sDzIxnmUADXzv2kT",
            images : [ {
                height : 640,
                url : "https://i.scdn.co/image/ac68a9e4a867ec3ce8249cd90a2d7c73755fb487",
                width : 629
            }, {
                height : 300,
                url : "https://i.scdn.co/image/d0186ad64df7d6fc5f65c20c7d16f4279ffeb815",
                width : 295
            }, {
                height : 64,
                url : "https://i.scdn.co/image/7c3ec33d478f5f517eeb5339c2f75f150e4d601e",
                width : 63
            } ],
            name : "Hot Fuss (Deluxe Version)",
            type : "album",
            uri : "spotify:album:4OHNH3sDzIxnmUADXzv2kT"
        },
        artists : [ {
            external_urls : {
                spotify : "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
            },
            href : "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
            id : "0C0XlULifJtAgn6ZNCW2eu",
            name : "The Killers",
            type : "artist",
            uri : "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
        } ],
        available_markets : [ "AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IS", "IT", "JP", "LI", "LT", "LU", "LV", "MC", "MT", "MY", "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "SE", "SG", "SK", "SV", "TR", "TW", "UY" ],
        disc_number : 1,
        duration_ms : 222200,
        explicit : false,
        external_ids : {isrc : "GBFFP0300052"
        },
        external_urls : {
            spotify : "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
        },
        href : "https://api.spotify.com/v1/tracks/3n3Ppam7vgaVa1iaRUc9Lp",
        id : "3n3Ppam7vgaVa1iaRUc9Lp",
        name : "Mr. Brightside",
        popularity : 73,
        preview_url : "https://p.scdn.co/mp3-preview/4839b070015ab7d6de9fec1756e1f3096d908fba",
        track_number : 2,
        type : "track",
        uri : "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
    };

})();




