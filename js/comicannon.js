/*!
 * comicannon
 * Copyright(c) 2016 Jonatan Bjork
 * MIT Licensed
 */

'use strict';

var frames, options;

// Below code was borrowed from jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html on 2016-01-24.
// Used to get strip date from the URL
$.extend({
  getUrlVars: function() {
    var vars = [], hash, hashes, i;
    hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++ ) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});

function comicannon(options) {
  // Initialise variables
  var canvas, star, i, availableItems,
      contentDir = "files/content/",
      defaultStarCoordinates = [],
      starSize = 0.8,
      numberOfStars = 30,
      x0 = options.x0,
      y0 = options.y0,
      frameWidth = options.frameWidth,
      frameHeight = options.frameHeight;

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function initFrames(frames) {
    var i, j, thisFrame, frameItems, thisItem, thisOffset;
    for ( i = 0; i < frames.length; i++ ) {
      thisOffset = i*frameWidth;
      addFrame(thisOffset);
      thisFrame = frames[i];
      frameItems = thisFrame['items'];
      for ( j = 0; j < frameItems.length; j++ ) {
        addItem(thisOffset, frameItems[j]);
      }
      addText(i, thisFrame['textlines']);
    }
  }

  function initCanvas() {
    // Create canvas
    canvas = new fabric.StaticCanvas('canvas');
    // Generate random numbers array for the default starscape view
    for ( i = 0; i < numberOfStars; i ++ ) {
      defaultStarCoordinates.push({
        x: getRandomNumber(0, frameWidth),
        y: getRandomNumber(0, frameHeight)
      })
    };
  }

  function initPage() {
    // Declare variables
    var filename, date;
    // Get site configuration
    $.getJSON("files/etc/config.json", function(data) {
      // Set disclaimer
      availableItems = data.availableItems;
      $("#disclaimer").text(data.disclaimer);
      // Get date from URL
      date = $.getUrlVar('date');
      // If date not defined, display today's strip
      if ( typeof date === "undefined" ) {
        // Today's date in format 'YYYY-MM-DD'
        date = new Date().toJSON().slice(0,10);
      }
      // Get frames for date
      filename = contentDir + date + ".json";
      var setFrames = $.getJSON( filename, function(data) {})
        .done(function(data) {
          frames = data.frames;
          // Initialise basic graphics
          initCanvas();
          // Build up frames
          initFrames(frames);
        })
        .fail(function() {
          console.error('Failed to fetch comic for date: ' + date);
          $("#frame0").html("There's nothing here. Yet.");
        });
    });
  }

  function addFrame(offset){
    // Place frame
    canvas.add(new fabric.Rect({
        top : x0,
        left : y0 + offset,
        width : frameWidth,
        height : frameHeight,
        fill : 'black',
        stroke: 'white',
        strokeWidth: 3,
        selectable: false
    }));
    // Place stars over frame
    for ( i = 0; i < defaultStarCoordinates.length; i ++ ) {
      canvas.add(new fabric.Polygon(
        [
          {x: 0, y: 0},
          {x: starSize, y: starSize},
          {x: starSize*2, y: 0},
          {x: starSize, y: -starSize}
        ],
        {
          left: defaultStarCoordinates[i].x + offset,
          top: defaultStarCoordinates[i].y,
          fill: 'white',
          selectable: false
        }
      ));
    }
  }

  function addItem(offset, item) {
    // Place item
    if ( availableItems[item['name']].displayType === 'image' ) {
      fabric.Image.fromURL(availableItems[item.name].path, function(img) {
        img.scale(item.scale).set({
          left: offset + item.x,
          top: item.y,
          selectable: false
        });
        canvas.add(img);
      });
    } else {
      //TODO: Add handling for other item types
      console.error('Item is not of displayType image')
    }
  }

  function addTextLabel(offset, x, y, text) {
    canvas.add(new fabric.Text(
      text,
      {
        left: offset + x,
        top: y,
        fill: 'black',
        fontFamily: 'Helvetica',
        fontSize: 10
      }
    ))
  }

  function addText(frameNumber, textlines) {
    var i, text = "";
    for ( i = 0; i < textlines.length; i++ ) {
      text += textlines[i] + '<br>'
    }
    $( "#frame" + frameNumber ).html(text);
  }

  // Initialise page
  initPage();
}
