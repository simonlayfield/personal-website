var listInspire = [];

$.ajax({
    url: "https://www.googleapis.com/storage/v1/b/simon-layfield-site/o?prefix=auto/" + content,
    method: "GET",
    success: function(response) {

        console.log(response);

        var n = 0;

        $.each(response.items, function (key, val) {
            listInspire.push({"image": val.name});
            n += 1;
            if (n == 3) {
                n = 0;
            }
        });
  }

});

var ractive = Ractive({
    el: '.some-container',
    template: '#template',
    data: {
        imageList: listInspire
    },
    oncomplete: function () {

        setTimeout(function(){

            listInspire = listInspire.reverse();

            var columnHeights = [],
            imagelists = document.querySelectorAll('.imagelist'),
            imageIncrement = 9,
            n = 0,
            scrollEnabled = true;

            var shortestColumn = function (arr) {
                var lowest = 0;
                for (var i = 1; i < arr.length; i++) {
                    if (arr[i] < arr[lowest]) lowest = i;
                }
                return lowest;
            }

            function insertImage (image, nextImage, lastImage) {

                [].forEach.call(imagelists, function(list, index) {
                    columnHeights[index] = list.offsetHeight;
                });

                var column = shortestColumn(columnHeights);

                imagelists[column].appendChild(image);

                setTimeout (function () {
                    image.className = 'loaded';
                    if (nextImage == lastImage) {
                        scrollEnabled = true;
                    }
                }, 500);

            }

            function loadImage (nextImage, lastImage) {

                if (nextImage.indexOf('.webm') > 0) {
                    var video = document.createElement('video');
                    video.autoplay = true;
                    video.loop = true;
                    video.controls = "controls";

                    var source = document.createElement('source');
                    source.src = 'https://storage.googleapis.com/simon-layfield-site/' + nextImage;
                    source.type = "video/webm";
                    video.appendChild(source);

                    video.addEventListener('loadeddata', function() {
                       insertImage(video);
                    }, false);

                } else {

                    var img = new Image();
                    img.src = 'https://storage.googleapis.com/simon-layfield-site/' + nextImage;
                    img.className = 'loaded';
                    img.onload = function() {
                        insertImage(img);
                    };

                }

            }

            function cycleImages () {

                scrollEnabled = false;

                if (n == listInspire.length) {
                    console.log('true');
                    scrollEnabled = false;
                    return;
                }

                if (n + imageIncrement > listInspire.length) {
                    var limit = listInspire.length;
                } else {
                    var limit = n + imageIncrement;
                }

                var lastImage = ractive.get('imageList.' + (limit - 1) + '.image');

                for (var i = n; i < limit; i++) {

                    var nextImage = ractive.get('imageList.' + i + '.image');
                    loadImage(nextImage, lastImage);
                    console.log(n, listInspire.length);

                }

                n = n + imageIncrement;

            }

            cycleImages();

            window.onscroll = function(ev) {
                if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)) {
                    if (scrollEnabled) {
                        cycleImages();
                    }
                }
            };

        }, 1000);

    }

});
