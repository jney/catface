// =======================================================================
//  Catface (for jQuery)
//  version: 1.0 beta
//  @requires jQuery v1.2 or later
//  
//  Licensed under the MIT:
//    http://www.opensource.org/licenses/mit-license.php
//  
//  catface is fishcat + facebox
//  Is almost like facebox see it at : http://famspam.com/facebox
//  
//  Usage:
//   
//   jQuery(document).ready(function($) {
//     $('a[rel*=catface]').catface();
//   });
//  
//   <a href="#terms" rel="catface">Terms</a>
//     Loads the #terms div in the box
//  
//   <a href="terms.html" rel="catface">Terms</a>
//     Loads the terms.html page in the box
//  
//   <a href="terms.png" rel="catface">Terms</a>
//     Loads the terms.png image in the box
//  
//  
//   You can also use it programmatically:
//  
//     jQuery.catface('some html')
//  
//   This will open a facebox with "some html" as the content.
//     
//     jQuery.catface(function($) { $.ajaxes() })
//  
//  thanks too err team : http://errtheblog.com/
// =======================================================================

(function($) {
  
  $.catface = function(data, settings) {
    $.catface.init();
    if(data.match(/\S/)){
      $.catface.loading();
      $.isFunction(data) ? data.call(this, $) : $.catface.open(data, settings);
    }
    return $;
  };
  
  $.catface.settings = {
    loading_image : '/images/loading.gif',
    close_image   : '/images/close.png'
  };
  
  $.catface.html = function(settings){
    return '\
      <div id="catface" style="display:none">\
        <div class="body" style="position:relative;z-index:100">\
          <a href="#" class="close" style="border:0;position:absolute;right:4px;top:4px">\
            <img src="' + $.catface.settings.close_image + '" alt="X" style="border:0"/>\
          </a>\
          <div class="content"></div>\
        </div>\
        <div class="loading" style="text-align:center">\
          <img src="' + $.catface.settings.loading_image + '" style="margin:auto;padding:10px 20px" alt="loading" />\
        </div>\
      </div>';
  };
  
  $.catface.loading = function(){
    return ($('#catface .loading:visible').length == 1);
  };
  
  $.fn.catface = function(settings) {
    $.catface.init(settings);
    var click_handler = function() {
      // stop if already loading
      if ($.catface.loading()) return false;
      
      $.catface.load();
      // div
      if (this.href.match(/#/)) {
        
        var url = window.location.href.split('#')[0];
        // is allowing to have directly parameters in href
        // ex: "#my_div&time=10"
        // this will show #my_div during 10 seconds
        var ary = this.href.replace(url,'').split("&");
        for(var v in ary){
          var k = ary[v].split("=");
          if(k.length==2) $.catface.settings[k[0]] = k[1];
        }
        // ary[0] is the target
        $.catface.open($(ary[0]).clone().show());
      // ajax
      } else {
        try {
          $.get( this.href, function(data) { $.catface.open(data); } );
        } catch(e) { alert(e); }
      }
      return false;
    };
    return this.click(click_handler);
  };
  
/**
  * The init function is a one-time setup which preloads vital images
  * and other niceities.
  */
  $.catface.init = function(settings) {
    if($.catface.settings.inited && typeof settings == 'undefined')
      return true;
      
    $.catface.settings.inited = true;
    
    settings && $.extend($.catface.settings, settings);
    
    if(typeof $.catface.timing == "undefined")
      $.catface.timing = false;
      
    if(typeof $.catface.running == "undefined")
      $.catface.running = false;
    
    if($("#catface") && $("#catface").length)
      return true;
      
    $.catface.settings.ie6 = (!window.XMLHttpRequest);
    
    $('body').append($.catface.html());
    var preload = [ new Image(), new Image() ];
    preload[0].src = $.catface.settings.close_image;
    preload[1].src = $.catface.settings.loading_image;
    
    $("#catface").css({ borderLeft: 0, borderRight: 0, bottom: 0, left: 0,
      marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0,
      position: "fixed", width: "100%" });
      
    if ($.catface.settings.ie6) {
      $("#catface").css({
        position: "absolute", right: "auto", bottom: "auto", overflow: "hidden",
        left: "expression((0 + ( ignoreMe2 = document.documentElement.scrollLeft ? \
          document.documentElement.scrollLeft : document.body.scrollLeft ) ) + 'px')",
        top: "expression(( -0 - catface.offsetHeight + \
          document.documentElement.clientHeight ? \
            document.documentElement.clientHeight : document.body.clientHeight) + \
          (ignoreMe = document.documentElement.scrollTop ? \
            document.documentElement.scrollTop : document.body.scrollTop)) + 'px' )"
      });
    }
    
    $('#catface .loading').hide();
    
    $('#catface .close_image').attr('src', $.catface.settings.close_image);
  };
  
  $.catface.load = function() {
    if ($.catface.loading()) return true;
    $(document).unbind('.catface');
    $('#catface .content').empty().hide();
    $('#catface .loading').show();
    $('#catface').slideDown('slow');

    $(document).bind('keydown.catface', function(e) {
      if (e.keyCode == 27) $.catface.close();
    });
  };
  
  $.catface.open = function(data, settings, extra_setup) {
    // return if no data
    if(!data.match(/\S/)) return $.catface.close();
    // deal with the settings
    var $s = $.catface.settings; $.extend($s, (settings || {}));
    $('#catface .content').append(data);
    $('#catface .loading').hide();
    // remove other added class_name
    $("#catface .content").removeClass().addClass('content');
    // add class_name if defined
    if($s.class_name != undefined)
      $("#catface .content").addClass($s.class_name);
    $('#catface .content').fadeIn('slow');
    if ($.isFunction(extra_setup)) extra_setup.call(this);
    $s.ie6 && $('body').css('overflow', 'hidden'); // Change IE6 hack back
    // this.options.time is time in seconds
    if ($s.time != undefined) {
      !$.catface.timing ? ($.catface.timing = true) : ($.catface.running = true);
      setTimeout(function(){ 
        if(!$.catface.running && !$.catface.loading()){
          $.catface.close(); $.catface.timing = false;
        } else $.catface.running = false ;
      }, $s.time * 1000);
    } else { $.catface.running = true; }
    
    // finally we bind close events
    $('#catface .close').
      bind('click.catface',$.catface.close);
    $('#catface .submit').
      bind('click.catface',function(){$.catface.close(true);});
  };
  
  $.catface.close = function(rtn) {
    if(typeof rtn != "boolean") rtn = false;
    $(document).unbind('.catface');
    $('#catface').slideUp(function(){
      $("#catface .content").removeClass().addClass('content');
      $('#catface .loading').hide();
      $.catface.settings.ie6 && $('body').css('overflow', 'visible');
    });
    return rtn;
  };
})(jQuery);