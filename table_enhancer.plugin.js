/*
 * Mike's table enhancer
 * Adds capabilities to your tables!
 */
 
 // Wrap the plugin in an IIFE (Imediately Invoke Function Expression)
 // To encapsulate the $ as a reference to jQuery
(function ($) {
  $.fn.table_enhancer = function(options) {
    // Allow the user to define options to override the defaults
    var configuration = $.extend( {}, $.fn.table_enhancer.defaults, options );
    this.table = this.table || Table.initialize(options);
    
    return this;
  };
  
  // Present our default configuration for easy customization
  $.fn.table_enhancer.defaults = {
    width: "45%"
  };

  var Table = {
    configuration: {},
    
    initialize: function (options) {
      options = this.dispatchAction(options); // if options are actually an action
      this.configure(options);
      return this;
    },
      
    // Call the action provided, if there is an action provided
    dispatchAction: function (action) {
      if (typeof options === "string") {
        this[action].call(this);
        action = {};
      }
      return action;
    },
    
    // Allow custom configuration to be pass
    configure: function (options) {
      $.extend( this.configuration, $.fn.table_enhancer.defaults, options );
    },
    
    // In charge of destroying the plugin
    destroy: function () {
      
    },
      
  };
  
  function buildHeaders() {
    
  }

})(jQuery);