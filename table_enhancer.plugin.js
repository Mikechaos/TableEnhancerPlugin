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
    this.table = Table.initialize(this, options);
    
    return this.table;
  };
  
  // Present our default configuration for easy customization
  $.fn.table_enhancer.defaults = {
    width: "45%",
    headers: ["Last Name", "First name", "Phone Number"],
    deleteCol: true,
    collection: [],
    hideIds: true,
  };

  var Table = {
    $elem: {},
    configuration: {},
    
    initialize: function ($table, options) {
      if (this.$elem.length > 0) return this;
      console.log('configure');
      this.$elem = $table;
      options = this.dispatchAction(options); // if options are actually an action
      this.configure(options);
      this.buildTable();
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
    
    buildTable: function () {
      var html = this.buildHeaders() + this.buildBody();
      this.$elem.html(html);
    },
      
    buildHeaders: function () {
      this.setHeadersFromCollection();
      headersHtml = "<thead><tr>";
      this.configuration.headers.forEach(function (header) {
        headersHtml += "<th>" + header + "</th>";
      });
        return headersHtml + '</tr></thead>';
    },
    
    setHeadersFromCollection: function () {
      var headers;
      if (this.configuration.collection.length > 0) {
        headers = Object.keys(this.configuration.collection[0])
        this.configuration.headers = this.formatHeaders(headers);
      }
    },
    
    formatHeaders: function (headers) {
      formattedHeaders = [];
      headers.forEach(function (header) {
        header = replaceUnderscore(header);
        header = capitalizeWords(header);
        formattedHeaders.push(header);
      });
      return formattedHeaders;
    },
      
    buildBody: function () {
      bodyHtml = "<tbody>";
      // this.headers.forEach(function (header) {
        // headersHtml += "<th>" + header + "</th>";
      // });
      return bodyHtml + '</tbody>';
    },
    
    // In charge of destroying the plugin
    destroy: function () {
      this.$elem = {};
    },
      
  };

})(jQuery);

function replaceUnderscore(header) {
  return header.replace(/_/g, ' ')
}

function capitalizeWords(header) {
  header = header.replaceAt(0, header[0].toUpperCase());
  return (rec = function (start) {
    var index;
    if (start === 0) return header;
    index = header.indexOf(' ', start) + 1;
    header = header.replaceAt(index, header[index].toUpperCase());
    return rec(index);
  })(1);
}

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}