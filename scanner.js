
window.onload = function() {
    var video = document.getElementById('video');
    //var canvas = document.getElementById('canvas');
    //var context = canvas.getContext('2d');

    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia ||
                             navigator.oGetUserMedia;

    var handleVideo = function(stream) {
        video.src = window.URL.createObjectURL(stream);
    };

    var videoError = function(e) {
        console.log(e);
    }

    if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true}, handleVideo, videoError);
    }
};
