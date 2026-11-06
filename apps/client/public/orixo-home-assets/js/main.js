(function($) {
    "use strict";
  
    const $documentOn = $(document);
    const $windowOn = $(window);
  
    $documentOn.ready( function() {
        
        

        /* =========================================================
        MOBILE MENU OPEN
        ========================================================= */
        $(".mobile-topbar .bars").on("click", function () {
            $(".mobile-menu-overlay, .mobile-menu-main").addClass("active");
            $("body").addClass("no-scroll");
            return false;
        });

        /* =========================================================
        MOBILE MENU CLOSE
        ========================================================= */
        $(".close-mobile-menu, .mobile-menu-overlay").on("click", function () {
            $(".mobile-menu-overlay, .mobile-menu-main").removeClass("active");
            $("body").removeClass("no-scroll");

            // reset all menus
            $('.sub-mobile-menu ul, .sub-child-menu ul').slideUp(200);

            // reset icons
            $(".sub-mobile-menu i, .sub-child-menu i")
                .removeClass("fa-chevron-up")
                .addClass("fa-chevron-down");
        });

        /* =========================================================
        MOBILE SUB MENU INITIAL STATE
        ========================================================= */
        $('.sub-mobile-menu > ul, .sub-child-menu > ul').hide();

        /* =========================================================
        LEVEL 1 MENU
        ========================================================= */
        $(document).on("click", ".sub-mobile-menu > a", function (e) {

            let $parent = $(this).parent();
            let $submenu = $parent.children("ul");

            if ($submenu.length === 0) return;

            e.preventDefault();
            e.stopPropagation();

            // close other level-1 menus
            $('.sub-mobile-menu')
                .not($parent)
                .children("ul")
                .slideUp(250);

            // also close level-2 menus
            $('.sub-child-menu > ul').slideUp(250);

            $submenu.slideToggle(250);

            // reset icons
            $(".sub-mobile-menu > a i, .sub-child-menu > a i")
                .removeClass("fa-chevron-up")
                .addClass("fa-chevron-down");

            $(this).find("i").toggleClass("fa-chevron-up fa-chevron-down");
        });

        /* =========================================================
        LEVEL 2 MENU
        ========================================================= */
        $(document).on("click", ".sub-child-menu > a", function (e) {

            let $parent = $(this).parent();
            let $submenu = $parent.children("ul");

            if ($submenu.length === 0) return;

            e.preventDefault();
            e.stopPropagation();

            // close sibling level-2 menus
            $parent.siblings(".sub-child-menu")
                .children("ul")
                .slideUp(250);

            $submenu.slideToggle(250);

            // reset sibling icons
            $parent.siblings(".sub-child-menu")
                .find("i")
                .removeClass("fa-chevron-up")
                .addClass("fa-chevron-down");

            $(this).find("i").toggleClass("fa-chevron-up fa-chevron-down");
        });

        /* =========================================================
        OFFCANVAS MENU
        ========================================================= */
        $(".offcanvas-btn").on('click', function () {
            $(".offcanvas-menu, .offcanvas-overlay").addClass("active");
            $("body").addClass("no-scroll"); // ✅ added
        });

        $(".offcanvas-overlay, .offcasvas-close").on('click', function () {
            $(".offcanvas-menu, .offcanvas-overlay").removeClass("active");
            $("body").removeClass("no-scroll"); // ✅ added
        });

        /* =========================================================
        STICKY HEADER (FINAL FIX)
        ========================================================= */
        $windowOn.on('scroll', function () {

            var scroll = $windowOn.scrollTop();

            // ✅ Mobile OR Offcanvas open → sticky completely disabled
            if (
                $(".mobile-menu-overlay").hasClass("active") ||
                $(".offcanvas-overlay").hasClass("active")
            ) {
                return;
            }

            if (scroll < 120) {
                $("#sticky-header").removeClass("sticky-menu");
                $("#header-fixed-height").removeClass("active-height");
            } else {
                $("#sticky-header").addClass("sticky-menu");
                $("#header-fixed-height").addClass("active-height");
            }
        });

    /*----------------------------------------------
        # Background Color
        ----------------------------------------------*/
        $("[data-bg-color]").each(function () {
            $(this).css("background-color", $(this).attr("data-bg-color"));
        });

        /*----------------------------------------------
        # Background Image
        ----------------------------------------------*/
        $("[data-background]").each(function () {
            $(this).css("background-image", "url(" + $(this).attr("data-background") + ")");
        });

        /*----------------------------------------------
        # Width
        ----------------------------------------------*/
        $("[data-width]").each(function () {
            $(this).css("width", $(this).attr("data-width"));
        });

        /*----------------------------------------------
        # Text Color
        ----------------------------------------------*/
        $("[data-text-color]").each(function () {
            $(this).css("color", $(this).attr("data-text-color"));
        });
        

    /* ================================
        Sidebar Toggle & Sticky Item Logic
        ================================ */

        // Open offcanvas
        $(".sidebar__toggle").on("click", function () {
        $(".offcanvas__info").addClass("info-open");
        $(".offcanvas__overlay").addClass("overlay-open");

        // Hide sticky item
        $(".sidebar-sticky-item").fadeOut().removeClass("active");
        });

        // Close offcanvas
        $(".offcanvas__close, .offcanvas__overlay").on("click", function () {
        $(".offcanvas__info").removeClass("info-open");
        $(".offcanvas__overlay").removeClass("overlay-open");

        // Show sticky item
        $(".sidebar-sticky-item").fadeIn().addClass("active");
        });

        /* ================================
        Body Overlay Js Start
        ================================ */

        $(".body-overlay").on("click", function () {
        $(".offcanvas__area").removeClass("offcanvas-opened");
        $(".df-search-area").removeClass("opened");
        $(".body-overlay").removeClass("opened");

        // Show sticky item when overlay clicked
        $(".sidebar-sticky-item").fadeIn().addClass("active");
        });

        /* ================================
        Offcanvas Link Click (Optional)
        ================================ */

        $(".offcanvas a").on("click", function () {
        $(".sidebar-sticky-item").fadeIn().addClass("active");
    });

    
      /* ================================
       Sticky Header Js Start
    ================================ */

       $windowOn.on("scroll", function () {
        if ($(this).scrollTop() > 250) {
          $("#header-sticky").addClass("sticky");
        } else {
          $("#header-sticky").removeClass("sticky");
        }
      });      
      
       /* ================================
       Video & Image Popup Js Start
    ================================ */

      $(".img-popup").magnificPopup({
        type: "image",
        gallery: {
          enabled: true,
        },
      });

      $(".video-popup").magnificPopup({
        type: "iframe",
        callbacks: {},
      });
  
      /* ================================
       Counterup Js Start
    ================================ */

      $(".count").counterUp({
        delay: 15,
        time: 4000,
      });
  
      /* ================================
       Wow Animation Js Start
    ================================ */

      new WOW().init();
  
      /* ================================
       Nice Select Js Start
    ================================ */

    if ($('.single-select').length) {
        $('.single-select').niceSelect();
    }

      /* ================================
       Parallaxie Js Start
    ================================ */

      if ($('.parallaxie').length && $(window).width() > 991) {
          if ($(window).width() > 768) {
              $('.parallaxie').parallaxie({
                  speed: 0.55,
                  offset: 0,
              });
          }
      }

      /* ================================
      Hover Active Js Start
    ================================ */

    $(".hero-small-slider .small-thumb,.service-box-items-3,.work-process-items-3, .choose-list li,.service-concept-box ").hover(
		// Function to run when the mouse enters the element
		function () {
			// Remove the "active" class from all elements
			$(".hero-small-slider .small-thumb,.service-box-items-3,.work-process-items-3, .choose-list li,.service-concept-box ").removeClass("active");
			// Add the "active" class to the currently hovered element
			$(this).addClass("active");
		}
	);

    

    /* ================================
      Custom Accordion Js Start
    ================================ */

    if ($('.accordion-box').length) {
        $(".accordion-box").on('click', '.acc-btn', function () {
            var outerBox = $(this).closest('.accordion-box');
            var target = $(this).closest('.accordion');
            var accBtn = $(this);
            var accContent = accBtn.next('.acc-content');

            if (target.hasClass('active-block')) {
                // Already open, so close it
                accBtn.removeClass('active');
                target.removeClass('active-block');
                accContent.slideUp(300);
            } else {
                // Close all others
                outerBox.find('.accordion').removeClass('active-block');
                outerBox.find('.acc-btn').removeClass('active');
                outerBox.find('.acc-content').slideUp(300);

                // Open clicked one
                accBtn.addClass('active');
                target.addClass('active-block');
                accContent.slideDown(300);
            }
        });
    }

    if ($('.service-box-style').length) {
        $(".service-box-style").on('click', '.service-acc-btn', function () {
            var outerBox = $(this).closest('.service-box-style');
            var target = $(this).closest('.accordion');
            var accBtn = $(this);
            var accContent = accBtn.next('.service-acc-content');

            if (target.hasClass('active-block')) {
                // Already open, so close it
                accBtn.removeClass('active');
                target.removeClass('active-block');
                accContent.slideUp(300);
            } else {
                // Close all others
                outerBox.find('.accordion').removeClass('active-block');
                outerBox.find('.service-acc-btn').removeClass('active');
                outerBox.find('.service-acc-content').slideUp(300);

                // Open clicked one
                accBtn.addClass('active');
                target.addClass('active-block');
                accContent.slideDown(300);
            }
        });
    }
    

     /* ================================
      Brand Slider Js Start
    ================================ */

   if ($('.brand-slider').length > 0) {
    const brandSlider = new Swiper(".brand-slider", {
        spaceBetween: 24,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        breakpoints: {
            1399: {
                slidesPerView: 8,
            },
            1199: {
                slidesPerView: 5,
            },
            991: {
                slidesPerView: 4,
            },
            767: {
                slidesPerView: 3,
            },
            575: {
                slidesPerView: 2,
            },
            400: {
                slidesPerView: 2,
            },
             0: {
                slidesPerView: 1,
            },
        },
    });
   }

    /* ================================
      Testimonial Slider Js Start
    ================================ */
     if ($('.testimonial-slider').length > 0) {
    const testimonialSlider = new Swiper(".testimonial-slider", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        pagination: {
            el: ".dot2",
            clickable: true,
        },
        breakpoints: {
            1399: {
                slidesPerView: 4,
            },
             1199: {
                slidesPerView: 3,
            },
            991: {
                slidesPerView: 2.4,
            },
            767: {
                slidesPerView: 1.3,
            },
            575: {
                slidesPerView: 1.3,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
    }

     if ($('.testimonial-slider-3').length > 0) {
    const testimonialSlider3 = new Swiper(".testimonial-slider-3", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        centeredSlides: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        breakpoints: {
            1199: {
                slidesPerView: 3,
            },
            991: {
                slidesPerView: 2,
            },
            767: {
                slidesPerView: 2,
            },
            575: {
                slidesPerView: 1,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
    }

    if ($('.testi-content-slider').length > 0) {
    const testiContentSlider = new Swiper(".testi-content-slider", {
        spaceBetween: 60,
        speed: 1300,
        loop: true,
          centeredSlides: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        
    });
   }

   if ($('.testimonial-client-slider').length > 0) {
    const testimonialClientSlider = new Swiper(".testimonial-client-slider", {
        spaceBetween: 60,
        speed: 1300,
        loop: true,
          centeredSlides: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        breakpoints: {
            1199: {
                slidesPerView: 3,
            },
            991: {
                slidesPerView: 3,
            },
            767: {
                slidesPerView: 3,
            },
            575: {
                slidesPerView: 2.1,
            },
            475: {
                slidesPerView: 2,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

      /* ================================
      Service Slider Js Start
    ================================ */
   if ($('.service-slider-3').length > 0) {
    const serviceSlider3 = new Swiper(".service-slider-3", {
        spaceBetween: 30,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        pagination: {
            el: ".dot",
            clickable: true,
        },
        breakpoints: {
            1199: {
                slidesPerView: 4,
            },
            991: {
                slidesPerView: 3,
            },
            767: {
                slidesPerView: 2,
            },
            575: {
                slidesPerView: 1.5,
            },
            0: {
                slidesPerView: 1.2,
            },
        },
    });
   }


     /* ================================
      News Slider Js Start
    ================================ */

   if ($('.news-slide-2').length > 0) {
    const newsSlide2 = new Swiper(".news-slide-2", {
        spaceBetween: 24,
        speed: 1300,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".array-next",
            prevEl: ".array-prev",
        },
        breakpoints: {
            1699: {
                slidesPerView: 5,
            },
            1399: {
                slidesPerView: 4.2,
            },
            1199: {
                slidesPerView: 3.5,
            },
            991: {
                slidesPerView: 2.6,
            },
            767: {
                slidesPerView: 2,
            },
            500: {
                slidesPerView: 1.5,
            },
            400: {
                slidesPerView: 1,
            },
            0: {
                slidesPerView: 1,
            },
        },
    });
   }

   if ($('.team-list-items').length) {

    let $teamTitles = $('.team-list-items .team-title');
    let $teamImages = $('.gt-team-one-images-outer .gt-team-one-image');

    $teamTitles.on('mouseenter', function () {
        let index = $(this).index();

        // active class toggle
        $teamTitles.removeClass('active');
        $(this).addClass('active');

        // image switch
        $teamImages.removeClass('active');
        $teamImages.eq(index).addClass('active');
    });

    }

      /*=================================
            Rain Effect
        =================================*/
        function makeItRain() {

            var $rainFront = $('.rain.front-row');
            var $rainBack  = $('.rain.back-row');

            $rainFront.empty();
            $rainBack.empty();

            var increment = 0;
            var drops = '';
            var backDrops = '';

            while (increment < 100) {

                var randoHundo = Math.floor(Math.random() * 98) + 1;
                var randoFiver = Math.floor(Math.random() * 4) + 2;

                increment += randoFiver;

                drops += `<div class="drop"
                    style="left:${increment}%; bottom:${(randoFiver * 2 + 100)}%;
                    animation-delay:0.${randoHundo}s;
                    animation-duration:0.5${randoHundo}s;">
                    <div class="stem"></div>
                    <div class="splat"></div>
                </div>`;

                backDrops += `<div class="drop"
                    style="right:${increment}%; bottom:${(randoFiver * 2 + 100)}%;
                    animation-delay:0.${randoHundo}s;
                    animation-duration:0.5${randoHundo}s;">
                    <div class="stem"></div>
                    <div class="splat"></div>
                </div>`;
            }

            $('.rain.front-row').html(drops);
            $('.rain.back-row').html(backDrops);
        }

        /*=================================
            Toggle
        =================================*/
        $('.splat-toggle').on('click', function () {
            $('body').toggleClass('splat-toggle');
            $(this).toggleClass('active');
            makeItRain();
        });

        $('.back-row-toggle').on('click', function () {
            $('body').toggleClass('back-row-toggle');
            $(this).toggleClass('active');
            makeItRain();
        });

        $('.single-toggle').on('click', function () {
            $('body').toggleClass('single-toggle');
            $(this).toggleClass('active');
            makeItRain();
        });

        // Init
        makeItRain();


  
    
   

    /* ================================
        Mouse Cursor Animation Js Start
    ================================ */

    // if ($(".mouseCursor").length > 0) {
    //     function itCursor() {
    //         var myCursor = jQuery(".mouseCursor");
    //         if (myCursor.length) {
    //             if ($("body")) {
    //                 const e = document.querySelector(".cursor-inner"),
    //                     t = document.querySelector(".cursor-outer");
    //                 let n, i = 0, o = !1;
    //                 window.onmousemove = function(s) {
    //                     if (!o) {
    //                         t.style.transform = "translate(" + s.clientX + "px, " + s.clientY + "px)";
    //                     }
    //                     e.style.transform = "translate(" + s.clientX + "px, " + s.clientY + "px)";
    //                     n = s.clientY;
    //                     i = s.clientX;
    //                 };
    //                 $("body").on("mouseenter", "button, a, .cursor-pointer", function() {
    //                     e.classList.add("cursor-hover");
    //                     t.classList.add("cursor-hover");
    //                 });
    //                 $("body").on("mouseleave", "button, a, .cursor-pointer", function() {
    //                     if (!($(this).is("a", "button") && $(this).closest(".cursor-pointer").length)) {
    //                         e.classList.remove("cursor-hover");
    //                         t.classList.remove("cursor-hover");
    //                     }
    //                 });
    //                 e.style.visibility = "visible";
    //                 t.style.visibility = "visible";
    //             }
    //         }
    //     }
    //     itCursor();
    // }

    /* ================================
        Back To Top Button Js Start
    ================================ */
    // $windowOn.on('scroll', function() {
    //     var windowScrollTop = $(this).scrollTop();
    //     var windowHeight = $(window).height();
    //     var documentHeight = $(document).height();

    //     if (windowScrollTop + windowHeight >= documentHeight - 10) {
    //         $("#back-top").addClass("show");
    //     } else {
    //         $("#back-top").removeClass("show");
    //     }
    // });

    // $documentOn.on('click', '#back-top', function() {
    //     $('html, body').animate({ scrollTop: 0 }, 800);
    //     return false;
    // });

    /* ================================
       Search Popup Toggle Js Start
    ================================ */

    if ($(".search-toggler").length) {
        $(".search-toggler").on("click", function(e) {
            e.preventDefault();
            $(".search-popup").toggleClass("active");
            $("body").toggleClass("locked");
        });
    }


    
	
    /* ================================
       Smooth Scroller And Title Animation Js Start
    ================================ */
    if ($('#smooth-wrapper').length && $('#smooth-content').length) {
        gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

        gsap.config({
            nullTargetWarn: false,
        });

        let smoother = ScrollSmoother.create({
            wrapper: "#smooth-wrapper",
            content: "#smooth-content",
            smooth: 2,
            effects: true,
            smoothTouch: 0.1,
            normalizeScroll: false,
            ignoreMobileResize: true,
        });
    }

    gsap.registerPlugin(ScrollTrigger);

    let mm = gsap.matchMedia();

    mm.add("(min-width: 1200px)", () => {

        gsap.to(".jump-anim", {
            x: 150,
            ease: "none",
            scrollTrigger: {
                trigger: ".work-title", // FIXED
                start: "top 80%",
                end: "bottom 20%",
                scrub: 1
            }
        });

        gsap.to(".studio-text", {
            x: -150,
            ease: "none",
            scrollTrigger: {
                trigger: ".work-title", // FIXED
                start: "top 80%",
                end: "bottom 20%",
                scrub: 1
            }
        });

    });

     


    /* ================================
    Text Anim Js Start
    ================================ */

    if (
    typeof SplitText !== "undefined" &&
        document.querySelectorAll(".split-title").length > 0
        ) {
    document.querySelectorAll(".split-title").forEach((title) => {

        // split by words + chars (IMPORTANT)
        const split = new SplitText(title, {
        type: "words,chars"
        });

        // add class to chars
        split.chars.forEach((char) => {
        char.classList.add("char");
        });

        // GSAP animation
        gsap.to(split.chars, {
        scrollTrigger: {
            trigger: title,
            start: "top 90%",
            toggleActions: "play none none none"
        },
        duration: 0.8,
        clipPath: "inset(0% 0% -15% 0%)",
        x: 0,
        opacity: 1,
        ease: "power4.out",
        stagger: 0.03
        });

    });
    }

     if (typeof gsap !== "undefined") {
          gsap.registerPlugin(ScrollTrigger, SplitText);

          let mm = gsap.matchMedia();

          mm.add("(min-width: 1200px)", () => {

              let splits = [];

              // ===== tz-sub-tilte =====
              $('.tz-sub-tilte').each(function (index, el) {

              let split = new SplitText(el, {
                  type: "lines,words,chars",
                  linesClass: "split-line"
              });

              splits.push(split);

              gsap.set(split.chars, {
                  opacity: 0,
                  x: 7
              });

              gsap.to(split.chars, {
                  scrollTrigger: {
                  trigger: el,
                  start: "top 90%",
                  end: "top 60%",
                  scrub: 1
                  },
                  x: 0,
                  opacity: 1,
                  duration: 0.7,
                  stagger: 0.2
              });
              });

              // ===== tz-itm-title =====
              $('.tz-itm-title').each(function (index, el) {

              let split = new SplitText(el, {
                  type: "lines,words,chars",
                  linesClass: "split-line"
              });

              splits.push(split);

              gsap.set(split.chars, {
                  opacity: 0.3,
                  x: -7
              });

              gsap.to(split.chars, {
                  scrollTrigger: {
                  trigger: el,
                  start: "top 92%",
                  end: "top 60%",
                  scrub: 1
                  },
                  x: 0,
                  opacity: 1,
                  duration: 0.7,
                  stagger: 0.2
              });
              });

              // ðŸ”¥ MOST IMPORTANT PART
              ScrollTrigger.refresh();

              // ðŸ”¥ cleanup on breakpoint change
              return () => {
              splits.forEach(split => split.revert());
              ScrollTrigger.getAll().forEach(st => st.kill());
              };

          });
    }

    if (document.querySelectorAll(".rr_title_anim").length > 0) {
    if ($('.rr_title_anim').length > 0) {
      let splitTitleLines = gsap.utils.toArray(".rr_title_anim");
      splitTitleLines.forEach(splitTextLine => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: splitTextLine,
            start: 'top 90%',
            end: 'bottom 60%',
            scrub: false,
            markers: false,
            toggleActions: 'play none none reverse'
          }
        });

        const itemSplitted = new SplitText(splitTextLine, { type: "words, lines" });
        gsap.set(splitTextLine, { perspective: 400 });
        itemSplitted.split({ type: "lines" })
        tl.from(itemSplitted.lines, {
          duration: 1,
          delay: 0.3,
          opacity: 0,
          rotationX: -80,
          force3D: true,
          transformOrigin: "top center -50",
          stagger: 0.2
        });
      });
    }
    }


     /* ================================
       Des Portfolio Anim Js Start
    ================================ */
    if (document.querySelector(".des-portfolio-wrap")) {

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1199px)", () => {

        const sections = document.querySelectorAll(".des-portfolio-panel");
        const wrap = document.querySelector(".des-portfolio-wrap");

        if (!sections.length || !wrap) return;

        // Initial state
        gsap.set(sections, {
            scale: 1,
            opacity: 1,
            autoAlpha: 1
        });

        sections.forEach((section, index) => {

            const isLast = index === sections.length - 1;

            // SCALE ANIMATION (same as before feel)
            gsap.to(section, {
                scale: isLast ? 1 : 0.8,
                opacity: isLast ? 1 : 0.6,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top 14%",
                    end: "bottom 90%",
                    scrub: true,
                    pin: true,
                    pinSpacing: false, // 🔥 original behavior preserved
                    endTrigger: wrap,
                },
            });

            // VISIBILITY CONTROL (optimized but same logic)
            ScrollTrigger.create({
                trigger: section,
                start: "top 14%",

                onEnter: () => {
                    sections.forEach((el, i) => {
                        if (i < index) {
                            gsap.set(el, { autoAlpha: 0 });
                        } else {
                            gsap.set(el, { autoAlpha: 1 });
                        }
                    });
                },

                onEnterBack: () => {
                    sections.forEach((el, i) => {
                        if (i < index) {
                            gsap.set(el, { autoAlpha: 0 });
                        } else {
                            gsap.set(el, { autoAlpha: 1 });
                        }
                    });
                }

            });

        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };

    });
    }

    /* ================================
       Card Animation Js Start
    ================================ */

   let pr = gsap.matchMedia();

    pr.add("(min-width: 1199px)", () => {

        const panels = gsap.utils.toArray('.tp-panel-pin');

        const triggers = panels.map((section) => {

            let defaultStart = "top 10%";
            let defaultEnd   = "bottom 55%";

            let startVal = section.dataset.start || defaultStart;
            let endVal   = section.dataset.end || defaultEnd;

            return ScrollTrigger.create({
                trigger: section,
                start: startVal,
                end: endVal,
                endTrigger: '.tp-panel-pin-area',
                pin: section,
                scrub: 1,
                pinSpacing: false,
                markers: false
            });

        });

        // IMPORTANT: cleanup for ThemeForest + matchMedia safety
        return () => {
            triggers.forEach(t => t.kill());
        };

    });

     /* ================================
    Animate Circle Js Start
    ================================ */

    if ($('.bz-gsap-animate-circle').length) {
    gsap.utils.toArray('.bz-gsap-animate-circle').forEach((el) => {

        // Accessibility: reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(el, { rotate: 0 });
        return;
        }

        gsap.timeline({
        scrollTrigger: {
            trigger: el,
            scrub: 1,
            start: "top 80%",
            end: "top 20%",
            markers: false
        }
        })
        .set(el, { transformOrigin: "50% 50%" })
        .fromTo(
        el,
        { rotate: 0 },
        { rotate: 180, ease: "none" }
        );
    });
    }
    
   if ($(".wa_split_up").length) {

        var wa_split_up = $(".wa_split_up");

        gsap.registerPlugin(SplitText, ScrollTrigger);

        wa_split_up.each(function (index, el) {

            el.split = new SplitText(el, {
                type: "lines,words,chars",
                linesClass: "split-line",
            });

            gsap.set(el, { perspective: 400 });

            let delayValue = $(el).attr("data-split-delay") || "0s";
            delayValue = parseFloat(delayValue) || 0;

            gsap.set(el.split.chars, {
                y: 50,
                opacity: 0,
            });

            el.anim = gsap.to(el.split.chars, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 86%",
                    toggleActions: "play none none reverse",
                },
                y: 0,
                opacity: 1,
                duration: 0.3,
                ease: "power1.out",
                stagger: 0.15,
                delay: delayValue,
            });

        });

    }

    if ($(".as-partner-3-big-title").length) {

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1200px)", () => {

        var waSplitup2hero2 = $(".as-partner-3-big-title");

        gsap.registerPlugin(SplitText, ScrollTrigger);

        waSplitup2hero2.each(function (index, el) {

            el.split = new SplitText(el, {
                type: "lines,words,chars",
                linesClass: "split-line",
            });

            gsap.set(el.split.chars, {
                yPercent: -560,
                opacity: 0,
            });

            gsap.to(el.split.chars, {
                scrollTrigger: {
                    trigger: el,
                    end: "top 30%",
                    toggleActions: "play none none reverse",
                    scrub: true,
                },
                opacity: 1,
                yPercent: 0,
                duration: 0.5,
                ease: "power1.out",
                stagger: 0.2,
            });

        });

        var asP3bigTitle = gsap.timeline({
            scrollTrigger: {
                trigger: ".as-partner-3-big-title",
                end: "top 10%",
                toggleActions: "play none none reverse",
                scrub: true,
            },
        });

        asP3bigTitle.from(".as-partner-3-big-title", {
            xPercent: 100,
        });

    });

    }

    /* ================================
      Title Animation
    ================================ */

   if ($(".wa_title_spilt_1").length) {

    gsap.registerPlugin(SplitText, ScrollTrigger);

    document.querySelectorAll(".wa_title_spilt_1").forEach((atEl) => {

        const atSplit = new SplitText(atEl, {
            type: "words,chars",
            wordsClass: "word",
            charsClass: "char",
        });

        let atDuration = parseFloat(atEl.getAttribute("data-speed")) || 0.6; // আগে 1 ছিল
        let atDelay = parseFloat(atEl.getAttribute("data-delay")) || 0;

        if (window.innerWidth <= 768) {
            atDuration = atDuration * 0.5; // আগে 0.3 ছিল → একটু balanced
        }

        gsap.set(atSplit.words, {
            willChange: "transform",
            perspective: 1000,
            transformStyle: "preserve-3d",
        });

        gsap.set(atSplit.chars, {
            willChange: "transform",
            opacity: 0,
            rotateX: -80,
            transformOrigin: "center center -10px",
        });

        gsap.set(atEl, {
            perspective: 1000,
            transformStyle: "preserve-3d",
        });

        gsap.to(atSplit.chars, {
            scrollTrigger: {
                trigger: atEl,
                start: "top 85%", 
            },
            opacity: 1,
            rotateX: 0,
            duration: atDuration,
            delay: atDelay,
            ease: "power2.out", 
            stagger: {
                each: 0.025, 
                from: "center",
            },
        });

    });

    }

   /* ================================
     Design Choose Item Animation 
    ================================ */

   if ($(".design-choose-item-wrap").length) {

    gsap.registerPlugin(ScrollTrigger);

    const pw = gsap.matchMedia();

    pw.add("(min-width: 1200px)", () => {

        document.querySelectorAll(".design-choose-item-wrap").forEach((wrap) => {

            const items1 = wrap.querySelectorAll(".design-choose-item-1");
            const items2 = wrap.querySelectorAll(".design-choose-item-2");

            items1.forEach((item1, i) => {

                const item2 = items2[i];

                if (item1 && item2) {

                    gsap.set(item1, { x: -400, rotate: -40 });
                    gsap.set(item2, { x: 400, rotate: 40 });

                    let tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: item1,
                            start: "top 90%",
                            end: "top 20%",
                            scrub: 1,
                        }
                    });

                    tl.to(item1, { x: 0, rotate: 0 })
                      .to(item2, { x: 0, rotate: 0 }, 0);

                }

            });

        });

    });

    }


    /*=============================================
    =         CLIP ANIMATION INIT                =
    =============================================*/
    initClipAnimation(); // ✅ MUST ADD THIS

       
    /*=============================================
    Testimonial Effect
    =============================================*/
    gsap.registerPlugin(ScrollTrigger);

    let mmw = gsap.matchMedia();

    mmw.add("(min-width: 1400px)", () => {

      const section = document.querySelector(".client-testimonial");
      if (!section) return;

      const title = section.querySelector(".section-3-title-wrapper");
      const items = gsap.utils.toArray(".client-testimonial__item");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=400%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // Title animation
      tl.to(title, {
        opacity: 0,
        filter: "blur(10px)",
        duration: 1
      });

      tl.addLabel("itemsStart");

      // Items animation
      tl.fromTo(
        items,
        {
          x: "450%",
          opacity: 0
        },
        {
          x: "0%",
          opacity: 1,
          duration: 1,
          stagger: 0.6,
          ease: "power3.out"
        },
        "itemsStart+=0.3"
      );

      // End hold space
      tl.to({}, { duration: 1 });
    })

    mm.add("(min-width: 1199px)", () => {
			let panels = document.querySelectorAll('.oit-panel-pin')
			panels.forEach((section, index) => {
				let startVal = section.dataset.start || 'top 30%'
				let endVal = section.dataset.end || 'bottom 50%'
				gsap.fromTo(
					section,
					{
						transformOrigin: '100% 0% 0px',
						x: 0,
						y: 0,
						rotate: 0,
						scale: 1,
					},
					{
						yPercent: 5,
						rotate: 20,
						scale: 0.75,
						ease: 'none',
						scrollTrigger: {
							trigger: section,
							pin: section,
							scrub: 1,
							start: startVal,
							end: endVal,
							endTrigger: '.oit-panel-pin-area',
							pinSpacing: false,
							markers: false,
						},
					}
				)
			})
	})

     /* ================================
       Approach Anim Js Start
    ================================ */

    if (document.querySelectorAll(".approach-area").length > 0) {

        const boxes = document.querySelectorAll(".approach-area .approach-box");

        gsap.from(boxes, {
        x: "100%",
        duration: 1,
        stagger: 0.3,
        ease: "power2.out",
        scrollTrigger: {
            scrub: 2,
            trigger: ".approach-wrapper-box",
            start: "top 100%",
            end: "bottom 40%",
            toggleActions: "play none none reverse",
        }
        });
    }

    /* ================================
       Project Card Animation Js Start
    ================================ */

	if ($('.tp-project-5-2-area').length > 0) {
		let project_text = gsap.timeline({
			scrollTrigger: {
				trigger: ".tp-project-5-2-area",
				start: 'top center-=350',
				end: "bottom 50%",
				pin: ".tp-project-5-2-title",
				markers: false,
				pinSpacing: false,
				scrub: 1,
			}
		})
		project_text.set(".tp-project-5-2-title", {
			scale: .6,
			duration: 2
		})
		project_text.to(".tp-project-5-2-title", {
			scale: 1,
			duration: 2
		})
		project_text.to(".tp-project-5-2-title", {
			scale: 1,
			duration: 2
		}, "+=2")

         project_text.to(".tp-project-5-2-title", {
            autoAlpha: 0,
            duration: 2
        });
	}


  
    }); // End Document Ready Function



    /* ================================
      CLIP ANIMATION FUNCTION   
    ================================ */
    function initClipAnimation() {

        const wrappers = document.querySelectorAll(".tp-clip-anim");
        if (!wrappers.length) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const wrapper = entry.target;
                const img = wrapper.querySelector(".tp-anim-img[data-animate='true']");
                if (!img) return;

                const url = img.getAttribute("src");

                // Ensure relative position
                if (getComputedStyle(wrapper).position === "static") {
                    wrapper.style.position = "relative";
                }

                // Remove old masks
                wrapper.querySelectorAll(".mask").forEach((m) => m.remove());

                const fragment = document.createDocumentFragment();

                for (let i = 0; i < 9; i++) {
                    const mask = document.createElement("div");
                    mask.className = `mask mask-${i + 1}`;

                    mask.style.cssText = `
                        background-image: url(${url});
                        background-size: cover;
                        background-position: center;
                        position: absolute;
                        inset: 0;
                    `;

                    fragment.appendChild(mask);
                }

                wrapper.appendChild(fragment);

                // Stop observing after trigger
                obs.unobserve(wrapper);
            });
        }, { threshold: 0.2 });

        wrappers.forEach((wrapper) => observer.observe(wrapper));
    }

    /* ================================
      Pricing Toggle Js Start
    ================================ */

   document.addEventListener("DOMContentLoaded", () => {

    const monthlyBtn = document.querySelector(".monthly-label");
    const yearlyBtn = document.querySelector(".yearly-label");
    const prices = document.querySelectorAll(".price");

    if (!monthlyBtn || !yearlyBtn || prices.length === 0) return;

    let currentType = "monthly";
    let isAnimating = false;

    function updatePrices(type) {
        if (isAnimating || currentType === type) return;

        isAnimating = true;
        currentType = type;

        prices.forEach(price => {

            // fade out
            price.classList.add("fade-out");

            setTimeout(() => {

                const value = price.getAttribute(`data-${type}`);
                const period = type === "monthly" ? "month" : "year";

                price.innerHTML = `$${value}<sub>/ ${period}</sub>`;

                // fade in
                price.classList.remove("fade-out");
                price.classList.add("fade-in");

                setTimeout(() => {
                    price.classList.remove("fade-in");
                    isAnimating = false;
                }, 300);

            }, 300);
        });
    }

    monthlyBtn.addEventListener("click", () => {
        monthlyBtn.classList.add("active");
        yearlyBtn.classList.remove("active");
        updatePrices("monthly");
    });

    yearlyBtn.addEventListener("click", () => {
        yearlyBtn.classList.add("active");
        monthlyBtn.classList.remove("active");
        updatePrices("yearly");
    });

    });


    /* ================================
       Preloader Js Start
    ================================ */
    function preloader() {

        const pct    = document.getElementById("pct");
        const fill   = document.getElementById("logoFill");
        const loader = document.getElementById("preloader");
        const page   = document.getElementById("page");

        if (!pct || !fill || !loader || !page) return;

        let startTime = null;
        const duration = 2400;

        const ease = (t) => 1 - Math.pow(1 - t, 3);

        function animate(timestamp) {
        if (!startTime) startTime = timestamp;

        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = ease(progress);
        const count = Math.round(eased * 100);

        pct.textContent = count;
        fill.style.clipPath = `inset(${100 - count}% 0 0 0)`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
            fill.classList.add("reveal");

            setTimeout(() => {
                loader.classList.add("hide");
                page.classList.add("visible");
            }, 500);
            }, 200);
        }
        }

        requestAnimationFrame(animate);
    }

    $windowOn.on("load", function () {
        preloader();
    });

  
  })(jQuery); // End jQuery

















