$(document).ready(function () {

    'use strict';

    var slider = $('.article-slider'),
        slides = slider.find('.article-content'),
        slideOffset = 0;

    if (slider.length > 0) {
        $(window).on('load ready', function () {
            updateSlides(slider);

            addNewsAfterLoad(slides);

            var lastScrollTop = 0;
            $(window).scroll(function () {
                var scrollPosition = window.pageYOffset,
                    activeSlide = slider.find('.active'),
                    prevSlide = activeSlide.prev('.article-content'),
                    nextSlide = activeSlide.next('.article-content'),
                    activeSlideLimit = activeSlide.data('limit'),
                    activeSlideHeight = activeSlide.outerHeight(true),
                    st = $(this).scrollTop();

                progressBar(slideOffset);

                activeSlide.css({
                    'top': -(scrollPosition - slideOffset)
                });

                var nextOverlay = nextSlide.find('.overlay'),
                    opacity = parseFloat(nextOverlay.css('opacity'));

                if (st < lastScrollTop) {
                    // Scroll Up

                    if (scrollPosition < prevSlide.data('limit')) {
                        if (prevSlide.length > 0) {
                            showPrevSlide(activeSlide, prevSlide);
                        }
                    }

                    if (scrollPosition < activeSlideLimit) {
                        if (opacity < 1) {
                            nextOverlay.css({
                                'opacity': opacity + 0.02
                            });
                        }
                    }
                } else {
                    // Scroll Down

                    if (scrollPosition + $(window).innerHeight() > activeSlideLimit) {
                        if (opacity > 0) {
                            nextOverlay.css({
                                'opacity': opacity - 0.02
                            });
                        }
                    }

                    if (scrollPosition >= activeSlideLimit) {
                        if (nextSlide.length > 0) {
                            showNextSlide(activeSlideHeight, nextOverlay, activeSlide, nextSlide);

                            if (!nextSlide.next('.article-content').length) {
                                slides = slider.find('.article-content');
                                appendSlides(slides);
                            }
                        }
                    }
                }
                lastScrollTop = st;
            });
        });


    }

    var progress_bar = $('.progress-bar');

    function progressBar(offsetDiff = 0) {
        var scrollPosition = window.pageYOffset - offsetDiff;
        var height = $('.article-content.active').outerHeight(true);
        var scrolled = (scrollPosition / height) * 100;

        progress_bar.css('width', scrolled + '%');
    }

    function addNewsAfterLoad(slides) {
        let data = {};

        data['news_ajax'] = true;
        data['main_id'] = slides.first().data('id');
        data['last_id'] = slides.last().data('id');

        $.ajax({
            url: 'https://stage.day.az/news.php',
            method: 'get',
            data: data,
            success: function (data) {
                let elem = $(data),
                    that = elem.appendTo('.article-content-wrapper'),
                    images = [];

                that.find('img').each(function (index, item) {
                    let img = $(item);

                    if (!img.parents('.banner-wrapper').length > 0) {
                        images.push(img);
                    }
                });

                let images_count = images.length;

                for (let i = 0; i < images_count; i++) {
                    images[i].on('load', function () {
                        images_count--;

                        if (images_count === 0) {
                            if (that.find('.article-gallery').length > 0) {
                                let images_list = that.find('.images-list');
                                galleryInit(images_list, true);
                            } else {
                                updateSlides(slider);
                            }
                        }
                    });
                }
            }
        });
    }

    function updateSlides(slider) {
        var bodyHeight = 0,
            zIndex = 9999,
            active = 1;

        slides = slider.find('.article-content');

        slides.each(function () {
            var that = $(this),
                slideHeight = Math.ceil(that.outerHeight(true));

            bodyHeight += slideHeight;

            that.css({
                'z-index': zIndex,
            });

            if (active === 1) {
                that.addClass('active');
                active = 0;
            } else {
                that.find('.overlay').css('opacity', .6);
            }

            that.attr('data-limit', bodyHeight);

            zIndex -= 1;
        });

        $('body').css({
            'height': bodyHeight
        });

        slider.parent().css({
            'height': bodyHeight
        });
    }

    function appendSlides(slides) {
        let data = {};

        data['news_ajax'] = true;
        data['main_id'] = slides.first().data('id');
        data['last_id'] = slides.last().data('id');

        $.ajax({
            url: 'https://stage.day.az/news.php',
            method: 'get',
            data: data,
            success: function (data) {
                let elem = $(data),
                    that = elem.appendTo('.article-content-wrapper'),
                    images = [],
                    bodyHeight = $('body').outerHeight(true),
                    zIndex = slides.last().css('z-index'),
                    slideHeight = 0;

                --zIndex;
                that.css('z-index', zIndex);
                that.find('.overlay').css('opacity', 1);

                that.find('img').each(function (index, item) {
                    let img = $(item);

                    if (!img.parents('.banner-wrapper').length > 0) {
                        images.push(img);
                    }
                });

                let images_count = images.length;

                for (let i = 0; i < images_count; i++) {
                    images[i].on('load', function () {
                        images_count--;

                        if (images_count === 0) {

                            if (that.find('.article-gallery').length > 0) {
                                let images_list = that.find('.images-list');
                                let ready = false;
                                galleryInit(images_list, false, ready, that);

                                setTimeout(function () {
                                    if (that.find('.article-gallery.ready').length > 0) {
                                        slideHeight = Math.ceil(that.outerHeight(true));

                                        bodyHeight += slideHeight;
                                        that.attr('data-limit', bodyHeight);

                                        $('body').css({
                                            'height': bodyHeight
                                        });

                                        slider.parent().css({
                                            'height': bodyHeight
                                        });

                                        slides = slider.find('.article-content');
                                    }
                                }, 100);

                            } else {
                                slideHeight = Math.ceil(that.outerHeight(true));

                                bodyHeight += slideHeight;
                                that.attr('data-limit', bodyHeight);

                                $('body').css({
                                    'height': bodyHeight
                                });

                                slider.parent().css({
                                    'height': bodyHeight
                                });

                                slides = slider.find('.article-content');
                            }
                        }
                    })
                }
            }
        });
    }

    function showNextSlide(activeSlideHeight, nextOverlay, activeSlide, nextSlide) {
        slideOffset += activeSlideHeight;
        nextSlide.addClass('active');

        let url = nextSlide.find('.article-link').text().trim(),
            title = nextSlide.find('.article-title-hidden').text().trim();
        history.replaceState('page', title, url);
        $('title').text(title);

        nextOverlay.css({
            'opacity': 0
        });
        $('.news-title').text(nextSlide.find('.article-title').text());
        activeSlide.removeClass('active');
    }

    function showPrevSlide(activeSlide, prevSlide) {
        slideOffset -= prevSlide.outerHeight(true);
        prevSlide.addClass('active');

        let url = prevSlide.find('.article-link').text().trim(),
            title = prevSlide.find('.article-title-hidden').text().trim();
        history.replaceState('page', title, url);
        $('title').text(title);

        $('.news-title').text(prevSlide.find('.article-title').text());
        activeSlide.css('top', 0);
        activeSlide.removeClass('active');
    }

    function galleryInit(images_list, after_load = false, ready = false, appended = null) {
        images_list.lightGallery({
            actualSize: false,
            autoplay: false,
            autoplayControls: false,
            download: false,
            thumbWidth: 150,
            thumbContHeight: 125,
            googlePlus: false,
            pinterest: false
        });

        images_list.lightSlider({
            item: 1,
            slideEndAnimation: true,
            keyPress: true,
            controls: true,
            prevHtml: '<i class="fas fa-angle-left"></i>',
            nextHtml: '<i class="fas fa-angle-right"></i>',
            gallery: true,
            thumbItem: 5,
            onSliderLoad: function () {
                if (after_load) {
                    updateSlides(slider);
                } else {
                    appended.find('.article-gallery').addClass('ready');
                }
            }
        });
    }
});