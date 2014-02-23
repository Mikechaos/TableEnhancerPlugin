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
    collection: [],
    deleteCol: true,
    ignoreIdCol: true,
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
      if (this.configuration.collection.length > 0) {
        this.configuration.headers = this.collectHeaders();
      }
    },

    collectHeaders: function () {
      var headers = Object.keys(this.configuration.collection[0])
      headers = this.adjustWithConfiguration(headers);
      this.configuration.properties = headers;
      return this.formatHeaders(headers);
    },

    adjustWithConfiguration: function (headers) {
      if (this.configuration.ignoreIdCol === true) {
        headers = headers.filter(function (header) {
          return header.indexOf('id') === -1;
        });
      }
      if (this.configuration.deleteCol) headers.push('Delete');
      return headers;
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
      var bodyHtml = "<tbody>",
        self = this;
      this.configuration.collection.forEach(function (object) {
        bodyHtml += self.fillRow(object);
      });
      return bodyHtml + '</tbody>';
    },

    fillRow: function (object) {
      var html = '<tr>', self = this;
      this.configuration.properties.forEach(function (property) {
        if (property === "Delete") return true;
        if (self.isAComplexType(object[property])) html += self.dealWithComplexProperty(object[property]);
        else html += '<td>' + object[property] + '</td>';
      });
      if (this.configuration.deleteCol === true) html += this.addDeleteAction(object.id);
      return html + '</tr>';
    },
      
    dealWithComplexProperty: function (object) {
      var html = '<td class="th-complex">', html2 = "";
      if (object.constructor === Array) {
        object = object[0];
      }
      if (object.constructor === Object) {
        for (key in object) {
          html2 += ((html2.length > 0) ? ' - ' : '') + object[key];
        }
      }
      return html + html2 + '</td>';
    },

    isAComplexType: function (object) {
      return (object.constructor === Array || object.constructor === Object);
    },
      
    addDeleteAction: function (id) {
      return '<td><button class="th-delete-action" data-id="' + id + '">X</button>';
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