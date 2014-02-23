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
    ignoredHeaders: ['Delete', 'Update'],
    collection: [],
    deleteCol: true,
    updateInPlace: true,
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
      this.setHandlers();
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
      if (this.configuration.updateInPlace) headers.push('Update');
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
        if (self.isAIgnoredProperty(property)) return true;
        if (self.isAComplexType(object[property])) html += self.dealWithComplexProperty(object[property]);
        else html += '<td>' + object[property] + '</td>';
      });
      if (this.configuration.updateInPlace === true) html += this.addUpdateAction(object.id);
      if (this.configuration.deleteCol === true) html += this.addDeleteAction(object.id);
      return html + '</tr>';
    },
    isAIgnoredProperty: function (property) {
      return this.configuration.ignoredHeaders.indexOf(property) !== -1;
    },

    dealWithComplexProperty: function (object) {
      var html = "", self = this;
        objectArray = [], addArrow = false;
      if (object.constructor === Array) {
        objectArray = object.slice(1);
        object = object[0];
        addArrow = objectArray.length > 0
      }
      if (object.constructor === Object) html += this.buildComplexType(object, 0, addArrow);
      if (objectArray.length > 0) {
        objectArray.forEach(function (object, i) {
          var order = i + 1;
          html += self.buildComplexType(object, order, true, true);
        });
      }
      return html;
    },

    buildComplexType: function (object, order, addArrow, hidden) {
      var html = "";
      for (key in object) {
        html += ((html.length > 0) ? ' - ' : '') + object[key];
      }
      return this.complexTdTemplate(order, html, addArrow, hidden)
    },

    // - TODO - hide arrow if complex object is alone
    complexTdTemplate: function (order, html, addArrow, hidden) {
      return '' + 
        '<td class="th-complex" data-order="' + order + '"' +
        ((hidden === true) ? ' style="display:none;"' : '') + '>' +
        html +
        ((addArrow === true) ? this.addNextElementArrow(order) : '') +
        '</td>';
    },

    addNextElementArrow: function (order) {
      return '&nbsp;&nbsp;<button title="Click to see next element" class="th-next-td-action" data-order="' +
        order + '" style="cursor:pointer">=&gt;</button>';
    },

    isAComplexType: function (object) {
      return (object.constructor === Array || object.constructor === Object);
    },

    addUpdateAction: function (id) {
      return '<td><button class="th-update-action" data-id="' + id + '">Edit</button>';
    },
    addDeleteAction: function (id) {
      return '<td><button class="th-delete-action" data-id="' + id + '">X</button>';
    },

    // In charge of destroying the plugin
    destroy: function () {
      this.$elem = {};
    },

    /*** HANDLERS ***/  
    setHandlers: function () {
      $(document).on('click', '.th-next-td-action', this.displayNextComplex);
    },
    
    displayNextComplex: function (e) {
      var $t = $(e.target).parent(),
        nextOrder = parseInt($t.attr('data-order') + 1);
      $t.hide();
      if ($(".th-complex[data-order=" + nextOrder + "]", $t.parent().parent()).length === 0) nextOrder = 0;
      $(".th-complex[data-order=" + nextOrder + "]", $t.parent().parent()).show()
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