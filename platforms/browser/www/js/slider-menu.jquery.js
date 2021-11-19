/**
 * jQuery Slider Menu Plugin
 *
 * @version 1.0.0
 */
 /* Modified to suit the app by Keshav Hegde (keshav.hegde@gmail.com) */
( function( $ ) {
  'use strict';

  $.fn.sliderMenu = function() {
    $( this ).each( function() {
      var $menu       = $( this ).clone(),
          $newMenu    = $( '<div>' ).addClass( 'slider-menu ' + $(this).attr("class")),
          $nav        = $( '<nav>' ).addClass( 'slider-menu__container' )
                                    .attr({
                                      'role':       'navigation',
                                      'aria-label': 'Menu'
                                    }),
          currentLeft = 0;
          var menuPath = [];
          sessionStorage.menuPath = JSON.stringify(menuPath);
          sessionStorage.currentLeft = 0;
      // Build the new menu.
      $menu.attr( 'class', 'slider-menu__menu' );
      $( 'ul', $menu ).addClass( 'slider-menu__menu ' )
                      .prepend( '<li><a href="#" class="slider-menu__back"><span class="icon"><i class="fa fa-chevron-left"></i></span></a>' )
                      .parent().addClass( 'slider-menu--has-children' );
      $( 'li', $menu ).addClass( 'slider-menu__item' );
      $( 'a', $menu ).addClass( 'slider-menu__link' );
      $nav.html( $menu );
      $( '[data-vertical="true"]', $nav ).addClass( 'slider-menu__item--vertical' );
      $newMenu.html( $nav );

      // Interaction functionality.
      $( $newMenu ).on( 'click', '.slider-menu__link', function( e ) {
        var $clickedLink = $( this ),
            $container   = $clickedLink.closest( '.slider-menu' ),
            $parentItem  = $clickedLink.parent( '.slider-menu__item' ),
            $parentMenu  = $parentItem.parent( '.slider-menu__menu' ),
            $childMenu   = $( '> .slider-menu__menu', $parentItem );

        var name = $($parentItem).data("name");
        var id = $($parentItem).data("id");
        var text = $(this).html();

        currentLeft = parseInt(sessionStorage.currentLeft);
        if(name != undefined && id != undefined){
            window.quizUI.load(name, id);
            sessionStorage.parentItem = id;
        }

        if ( $childMenu.length || $clickedLink.hasClass( 'slider-menu__back' ) ) {
          e.preventDefault();
          if ( $parentItem.data( 'vertical' ) ) {
            // Vertical menu.
            if ( $childMenu.is( ':visible' ) ) {
              // Hide
              $parentMenu.addClass( 'slider-menu--active' );
              $childMenu.hide();
              $container.css( 'height', $parentMenu.height() );
              /*$childMenu.slideUp( 200, function() {
                $container.css( 'height', $parentMenu.height() );
              });*/
              $clickedLink.removeClass( 'slider-menu__link--active-link' );
            } else {
              // Show
              $childMenu.show();
              $container.css( 'height', $parentMenu.height() );
              /*$childMenu.slideDown( 200, function() {
                $container.css( 'height', $parentMenu.height() );
              });*/
              $clickedLink.addClass( 'slider-menu__link--active-link' );
            }
          } else {
            $( '.slider-menu__item--vertical .slider-menu__menu', $container ).hide();
            $( '.slider-menu__item--vertical .slider-menu__link', $container ).removeClass( 'slider-menu__link--active-link' );

            // Horizontal menu.
            if ( $clickedLink.hasClass( 'slider-menu__back' ) ) {
              // Go back.
              var prevMenu = menuPath[menuPath.length - 1];
              quizUI.load(prevMenu.name, prevMenu.id);
              menuPath.pop();
              sessionStorage.menuPath = JSON.stringify(menuPath);
              var $activeMenu = $parentMenu.parent().parent();
              currentLeft -= 100;
              $nav.css( 'left', '-' + currentLeft + '%' );

              $parentMenu.removeClass( 'slider-menu--active' );
              $activeMenu.addClass( 'slider-menu--active' )
                         .parents( '.slider-menu__menu' ).addClass( 'slider-menu--active' );
              sessionStorage.menuHeight = $parentMenu.height();
              $container.css( 'height', $activeMenu.height());

            } else {
              $(this).parent().find(":first-child").find('a').find(".slider-menu__span").remove();
              $(this).parent().find(":first-child").find('a').append("<span class='slider-menu__span'>" + text + "</span>");
              menuPath.push({"name":name, "id": id, "left": currentLeft, "height": $parentMenu.height() });
              sessionStorage.menuPath = JSON.stringify(menuPath);
              currentLeft += 100;

              $nav.css( 'left', '-' + currentLeft + '%' );

              $parentMenu.removeClass( 'slider-menu--active' );
              $childMenu.addClass( 'slider-menu--active' )
                        .parents( '.slider-menu__menu' ).addClass( 'slider-menu--active' );
              sessionStorage.menuHeight = $parentMenu.height();
              $container.css( 'height', $childMenu.height() );
            }
          }
        }else{
          $("#mainMenu").removeClass("is-active");
          $(".navbar-burger").removeClass("is-active");
          $("#filler").height(0);
        }

        sessionStorage.currentLeft = currentLeft;
        if(currentLeft == 0){
          menuPath = [];
          sessionStorage.menuPath = JSON.stringify(menuPath);
        }
      });

      // Replace the current menu.
      $( this ).replaceWith(  $newMenu  );
    });
  };
})( jQuery );
