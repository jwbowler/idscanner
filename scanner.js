
window.onload = function() {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

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

    var width = 640;
    var height = 480;

    var u8ToImageDataBuf = function(data_u8, imageData) {
        var data_u32 = new Uint32Array(imageData.data.buffer);
        var alpha = (0xff << 24);
        var i = data_u8.cols * data_u8.rows;
        var pix = 0;
        while (--i >= 0) {
            pix = data_u8.data[i];
            data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
        }
    }

    img_u8 = new jsfeat.matrix_t(640, 480, jsfeat.U8C1_t);
    img_gxgy = new jsfeat.matrix_t(640, 480, jsfeat.S32C2_t);
    img_mag = new jsfeat.matrix_t(640, 480, jsfeat.S32C1_t);

    $(".container").click(function() {

        context.drawImage(video, 0, 0, 640, 480);
        var imageData = context.getImageData(0, 0, 640, 480);

        jsfeat.imgproc.grayscale(imageData.data, 640, 480, img_u8);

        jsfeat.imgproc.gaussian_blur(img_u8, img_u8, 3);

        jsfeat.imgproc.sobel_derivatives(img_u8, img_gxgy);

        var i = img_u8.cols*img_u8.rows, gx = 0, gy = 0;
        var x=0,y=0,dx=0,dy=0;
        var agx=0, agy=0;
        var gd=img_gxgy.data, mag=img_mag.data, id=img_u8.data;

        while(--i >= 0) {
            gx = gd[i<<1];
            gy = gd[(i<<1)+1];
            mag[i] = gx*gx + gy*gy;
        }

        for(y = 1; y < img_u8.rows - 1; ++y) {
            i = (y * img_u8.cols + 1)|0;
            for(x = 1 ; x < img_u8.cols - 1; ++x, ++i) {

                gx = gd[i<<1];
                gy = gd[(i<<1)+1];
                agx = ((gx ^ (gx >> 31)) - (gx >> 31))|0;
                agy = ((gy ^ (gy >> 31)) - (gy >> 31))|0;

                if(gx > 0) dx = 1;
                else dx = -1;

                if(gy > 0) dy = img_u8.cols;
                else dy = -img_u8.cols;

                var a1, a2, b1, b2, A, B, point;
                if(agx > agy) {
                    a1 = mag[i+dx];
                    a2 = mag[i+dx+(-dy)];
                    b1 = mag[i-dx];
                    b2 = mag[i-dx+dy];
                    A = (agx - agy)*a1 + agy*a2;
                    B = (agx - agy)*b1 + agy*b2;
                    point = mag[i] * agx;
                    if(point >= A && point > B) {
                        id[i] = agx&0xff;
                    }
                    else {
                        id[i] = 0x0;
                    }
                } else  {
                    a1 = mag[i+(-dy)];
                    a2 = mag[i+dx+(-dy)];
                    b1 = mag[i+dy];
                    b2 = mag[i-dx+dy];
                    A = (agy - agx)*a1 + agx*a2;
                    B = (agy - agx)*b1 + agx*b2;
                    point = mag[i] * agy;
                    if(point >= A && point > B) {
                        id[i] = agy&0xff;
                    }
                    else {
                        id[i] = 0x0;
                    }
                }
            }
        }

        var data_u32 = new Uint32Array(imageData.data.buffer);
        var alpha = (0xff << 24);
        var pix = 0;
        i = img_u8.cols*img_u8.rows;
        while(--i >= 0) {
            pix = id[i];
            data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
        }

        context.putImageData(imageData, 0, 0);

    });
};
