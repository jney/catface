//  **Catface (for jQuery)**
//
//  version: 1.0 beta
//
//  @requires jQuery v1.2 or later
//  
//  Licensed under the 
//  [MIT](http://www.opensource.org/licenses/mit-license.php)
//  
//  catface is fishcat + [facebox](http://defunkt.github.com/facebox/)
//  
//  Usage:
//  
//     jQuery(document).ready(function($) {
//       $("a[rel*=catface]").catface();
//     });
//  
//  `<a href="#terms" rel="catface">Terms</a>`
//  loads the #terms div in the box :
//  
//  `<a href="terms.html" rel="catface">Terms</a>`
//  loads the terms.html page in the box
//  
//  `<a href="terms.png" rel="catface">Terms</a>`
//  loads the terms.png image in the box
//  
//  You can also use it programmatically:
//  
//     jQuery.catface("some html");
//  
//  This will open a facebox with "some html" as the content.
//    
//     jQuery.catface(function($) { $.ajaxes() });

//### Main Documentation

(function($) {
  
  $.catface = function (data, settings) {
    $.catface.init();
    if(data.match(/\S/)){
      $.catface.load();
      $.isFunction(data) ? data.call(this, $) : $.catface.open(data, settings);
    }
    return $;
  };
  
  // Basic settings
  $.catface.settings = {
    loadingImage : "/images/loading.gif",
    closeImage   : "/images/close.png"
  };
  
  // Html
  $.catface.html = function (settings) {
    return '\
<!--[if lte IE 6 ]>\
  <div id="catface" class="catface-ie">\
<![endif]-->\
<!--[if (gt IE 6)|!IE]>-->\
  <div id="catface">\
<!--<![endif]-->\
  <div class="catface-body">\
    <a href="#" class="catface-close">\
      <img src="' + $.catface.settings.closeImage + '" alt="X" />\
    </a>\
    <div class="catface-content"></div>\
  </div>\
  <div class="catface-loading">\
    <img src="' + $.catface.settings.loadingImage + '" alt="loading" />\
  </div>\
</div>';
  };
  
  // Check if current browser is Internet Explorer 6
  $.catface.isIE6 = function () {
    return !!$("#catface.catface-ie").length;
  };

  // Check if catface is loading some content
  $.catface.isLoading = function () {
    return !!$("#catface .catface-loading:visible").length;
  };
  
  // Plugin constructor
  $.fn.catface = function (settings) {
    $.catface.init(settings);
    var clickHandler = function () {
      // stop if already loading
      if ($.catface.isLoading()) return false;
      
      $.catface.load();
      
      // pass arguments through anchor
      if (this.href.match(/#/)) {
        var url = location.hash.substr(1);
        // is allowing to have directly parameters in href
        // ex: "#my-div&time=10"
        // this will show #my-div during 10 seconds
        var ary = this.href.replace(url,"").split("&");
        for(var v in ary){
          var k = ary[v].split("=");
          if(k.length == 2) $.catface.settings[k[0]] = k[1];
        }
        // ary[0] is the target
        $.catface.open($(ary[0]).clone().show());
      // ajax
      } else {
        $.get(this.href, $.catface.open);
      }
      return false;
    };
    return this.click(clickHandler);
  };
  
  // The init function is a one-time setup which preloads vital images
  // and other niceities.
  $.catface.init = function (settings) {
    if($.catface.settings.inited && typeof settings == "undefined")
      return true;
      
    $.catface.settings.inited = true;
    
    settings && $.extend($.catface.settings, settings);
    
    if(typeof $.catface.timing == "undefined") $.catface.timing = false;
      
    if(typeof $.catface.running == "undefined") $.catface.running = false;
    
    if($("#catface").length) return true;
    
    $("body").append($.catface.html());
    
    // preloading our images
    var preload = [new Image(), new Image()];
    preload[0].src = $.catface.settings.closeImage;
    preload[1].src = $.catface.settings.loadingImage;
    
    $("#catface .catface-loading").hide();
    
    $("#catface a.catface-close img:first").
      attr("src", $.catface.settings.closeImage);
    
    $("#catface a.catface-loading img:first").
      attr("src", $.catface.settings.loadingImage);
  };
  
  // Start to load the content with a "loading" state
  $.catface.load = function () {
    // quit if it is already loading some content
    if ($.catface.isLoading()) return true;
    $(document).unbind(".catface");
    $("#catface .catface-content").empty().hide();
    $("#catface .catface-loading").show();
    $("#catface").slideDown("slow");
    
    // enable esc key to close catface
    $(document).bind("keydown.catface", function(e) {
      if (e.keyCode == 27) $.catface.close();
    });
  };
  
  // open 
  $.catface.open = function (data, settings, extraSetup) {
    // return if no data
    if(!data.match(/\S/)) return $.catface.close();
    
    // deal with the settings
    var $s = $.catface.settings;
    $.extend($s, (settings || {}));
    $("#catface .catface-content").append(data);
    $("#catface .catface-loading").hide();
    
    // remove other added className
    $("#catface .catface-content").
      removeClass().
      addClass("catface-content");
    
    // add className if defined
    if($s.className != undefined)
      $("#catface .catface-content").addClass($s.className);
      
    $("#catface .catface-content").fadeIn("slow");
    if ($.isFunction(extraSetup)) extraSetup.call(this);
    
    // Change IE6 hack back
    if ($.catface.settings.isIE6) $("body").css("overflow", "hidden");
    
    // this.options.time is time in seconds
    if ($s.time != undefined) {
      !$.catface.timing ? 
        ($.catface.timing = true) : ($.catface.running = true);
      setTimeout(function(){ 
        if(!$.catface.running && !$.catface.isLoading()){
          $.catface.close(); $.catface.timing = false;
        } else $.catface.running = false;
      }, $s.time * 1000);
    } else $.catface.running = true;
    
    // finally we bind close events
    $("#catface .catface-close").
      bind("click.catface",$.catface.close);
    $("#catface .catface-submit").
      bind("click.catface",function () { $.catface.close(true); });
  };
  
  $.catface.close = function (rtn) {
    if(typeof rtn != "boolean") rtn = false;
    $(document).unbind(".catface");
    $("#catface").slideUp(function(){
      // remove other added className
      $("#catface .catface-content").
        removeClass().
        addClass("catface-content");
      $("#catface .catface-loading").hide();
      if ($.catface.settings.isIE6) $("body").css("overflow", "visible");
    });
    return rtn;
  };
})(jQuery);