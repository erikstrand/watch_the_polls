var abbreviations = {
   Alabama     : "AL",
   Alaska      : "AK",
   Arizona     : "AZ",
   Arkansas    : "AR",
   California  : "CA",
   Colorado    : "CO",
   Connecticut : "CT",
   Delaware    : "DE",
   "District of Columbia": "DC",
   Florida     : "FL",
   Georgia     : "GA",
   Hawaii      : "HI",
   Idaho       : "ID",
   Illinois    : "IL",
   Indiana     : "IN",
   Iowa        : "IA",
   Kansas      : "KS",
   Kentucky    : "KY",
   Louisiana   : "LA",
   Maine       : "ME",
   Maryland    : "MD",
   Massachusetts: "MA",
   Michigan    : "MI",
   Minnesota   : "MN",
   Mississippi : "MS",
   Missouri    : "MO",
   Montana     : "MT",
   Nebraska    : "NE",
   Nevada      : "NV",
   "New Hampshire": "NH",
   "New Jersey": "NJ",
   "New Mexico": "NM",
   "New York"  : "NY",
   "North Carolina": "NC",
   "North Dakota": "ND",
   Ohio        : "OH",
   Oklahoma    : "OK",
   Oregon      : "OR",
   Pennsylvania: "PA",
   "Rhode Island": "RI",
   "South Carolina": "SC",
   "South Dakota": "SD",
   Tennessee   : "TN",
   Texas       : "TX",
   Utah        : "UT",
   Vermont     : "VT",
   Virginia    : "VA",
   Washington  : "WA",
   "West Virginia": "WV",
   Wisconsin   : "WI",
   Wyoming     : "WY"
};


// timeline events
var timeline_events = [
   {
      date: new Date(2012, 4, 29),
      description: "Romney wins the Texas primary."
   },
   {
      date: new Date(2012, 7, 11),
      description: "Ryan announced as Romney's VP."
   },
   {
      date: new Date(2012, 7, 30),
      description: "Romney accepts GOP nomination."
   },
   {
      date: new Date(2012, 9, 3),
      description: "First Presidential Debate"
   },
   {
      date: new Date(2012, 9, 11),
      description: "Vice Presidential Debate"
   },
   {
      date: new Date(2012, 9, 16),
      description: "Second Presidential Debate"
   },
   {
      date: new Date(2012, 9, 22),
      description: "Third Presidential Debate"
   },
   {
      date: new Date(2012, 10, 6),
      description: "Election Day"
   }
];


// layout variables
var mapHeight = 475;
var mapWidth = 1065;
var width = 900;
var timelineHeight = 100;
var timelineWidth = 600;

// data variables
var data = {};

function normalize1 (datum) {
   var result = {};
   var total = datum.Obama + datum.Romney;
   result.Obama = datum.Obama * 100 / total;
   result.Romney = datum.Romney * 100 / total;
   return result;
}

function normalize2 (datum) {
   var result = {};
   result.Obama = datum.Obama + datum.Other / 2;
   result.Romney = datum.Romney + datum.Other / 2;
   return result;
}

var normalize = normalize1;


function getStat (state, date) {
   var result = {
      State: state,
      Abbreviation: abbreviations[state],
      Obama: null,
      Romney: null,
      Other: null 
   };

   if (data[state] == undefined || data[state][date] == undefined) {
      return result;
   } else {
      var datum = data[state][date];

      if (datum.Obama != undefined) {
         result.Obama = datum.Obama;
      }

      if (datum.Romney != undefined) {
         result.Romney = datum.Romney;
      }
      
      if (datum.Other != undefined) {
         result.Other = datum.Other;
      }

      if (datum.Obama !== null && datum.Romney !== null && datum.Other !== null) {
         result.Index = datum.Obama * 100 / (datum.Obama + datum.Romney);
      }

      return result;
   }
}

function getStats (date) {
   var results = [];
   for (state in abbreviations) {
      results.push(getStat(state, date));
   }
   return results;
}


var lookupFormat = d3.time.format("%Y-%m-%d");
var currentDate = new Date(2012, 8, 1);

function getFontSize (d3_element) {
   return Number(getComputedStyle(d3_element.node()).fontSize.slice(0, -2));
}


// ==================== Map ====================

function map () {
   var originalWidth = 973;
   var originalHeight = 477;
   var scale = 0.975;
   var width = 600;

   var path = d3.geo.path();

   var root_g = null;
   var map = null;

   var white = d3.rgb(255, 255, 255);
   var purple = d3.rgb(145, 60, 95);
   var blue = d3.rgb(50, 130, 200);
   var red = d3.rgb(252, 50, 42);
   var grey = d3.rgb(180, 180, 180);

   var blueInterpolator = d3.interpolateRgb(purple, blue);
   var redInterpolator = d3.interpolateRgb(purple, red);

   function colorScale (percent) {
      return Math.pow((percent - 50) / 50, 1);
   }

   function colorScale2 (percent) {
      return 1 / (1 + Math.exp( -1.4 * percent + 74) );
   }

   function getColor (datum) {
      if (datum.Obama === null || datum.Romney === null || datum.Other === null) {
         return grey;
      }

      var normalized = normalize(datum);

      if (normalized.Obama >= normalized.Romney) {
         return blueInterpolator(colorScale2(normalized.Obama));
      } else {
         return redInterpolator(colorScale2(normalized.Romney));
      }
   }

   function adjustIndex (index) {
      if (index >= 50.0) {
         return colorScale2(index) * 0.5 + 0.5;
      } else {
         return colorScale2(100 - index) * -0.5 + 0.5;
      }
   }


   function render (selection) {
      selection.each( function (data) {
         root = d3.select(this);
         map = root.append("g").attr("transform", "translate(0,-5)scale(" + scale + ")");

         map.selectAll(".state")
            .data(data)
            .enter()
            .append("path")
            .attr("class", "state")
            .attr("id", function (d, i) {
               return "map_" + d.properties.name.replace(' ', '_');
            })
            .style("fill", grey)
            .attr("d", path)
            .on("mouseover", function (d) {
               highlight(d.properties.name);
            })
            .on("mouseout", function (d) {
               unhighlight(d.properties.name);
            })
      });
   }

   render.color = function (data) {
      for (var i=0; i<data.length; ++i) {
         var color = getColor(data[i]);
         d3.select("#map_" + data[i].State.replace(' ', '_')).style("fill", color);
      }
   };

   render.width = function (_) {
      if (!arguments.length) { return width; }
      width = _;
      return render;
   };

   render.height = function () {
      return originalHeight * scale;
   };

   render.blue = function () { return blue; }
   render.purple = function () { return purple; }
   render.red = function () { return red; }
   render.adjustedIndex = function (index) { return adjustIndex(index); }

   return render;
}


// ==================== Map Key ====================

function map_key (map) {
   var height = 100;
   var lineHeight = 0;
   var lineSpace = 0;

   var root = null;

   function render (selection) {
      selection.each ( function () {
         root = d3.select(this);
         lineHeight = getFontSize(root);
         lineSpace = ( height - lineHeight ) / 2;

         var defs = root.append("defs");
         var grad = defs.append("linearGradient")
            .attr("id", "key_grad")
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%");
         grad.append("stop")
            .attr("offset", "0%")
            .attr("style", "stop-color:" + map.blue().toString() + "; stop-opacity:1");
         grad.append("stop")
            .attr("offset", "50%")
            .attr("style", "stop-color:" + map.purple().toString() + "; stop-opacity:1");
         grad.append("stop")
            .attr("offset", "100%")
            .attr("style", "stop-color:" + map.red().toString() + "; stop-opacity:1");

         root.append("rect")
            .attr("class", "key_rect")
            .attr("x", -1.5 * lineHeight -2)
            .attr("y", 0)
            .attr("width", 1.5 * lineHeight)
            .attr("height", height)
            .attr("fill", "url(#key_grad)");

         var text_g = root.append("g")
            .attr("transform", "translate(" + (-2.5 * lineHeight) + "," + lineHeight + ")");

         text_g.append("text")
            .attr("text-anchor", "end")
            .attr("class", "map_key_text")
            .text("Obama");

         text_g.append("text")
            .attr("transform", "translate(0," + (lineSpace) + ")")
            .attr("text-anchor", "end")
            .attr("class", "map_key_text")
            .text("Contested");

         text_g.append("text")
            .attr("transform", "translate(0," + (2 * lineSpace) + ")")
            .attr("text-anchor", "end")
            .attr("class", "map_key_text")
            .text("Romney");

      });
   }

   render.height = function (_) {
      if (!arguments.length) { return height; }
      height = _;
      return render;
   }

   return render;
}


// ==================== Timeline ====================

function timeline () {
   // display variables
   var length = 900;
   var controlWidth = 30;
   var leftMargin = 20;
   var aboveHeight = 175;
   var centerHeight = 40;
   var belowHeight = 0;
   var dotRadius = 8;
   var needleRadius = 10;
   var nTicks = 5;
   var displayFormat = d3.time.format("%b %d");
   var textSpace = 5;
   var textRotation = 40;

   // state variables
   var startDate = new Date(2012, 4, 25);
   var endDate = new Date(2012, 10, 7);
   var lastDataDate = new Date(2012, 10, 3);
   var currentDate = new Date(2012, 8, 1);
   var onDateChange = null;
   var playing = false;

   // secondary variables (not exposed to user)
   var scale = d3.time.scale()
      .domain([startDate, endDate])
      .range([0, length])
      .nice(d3.time.day)
      .clamp(true);

   var circle_gen = d3.svg.arc()
      .innerRadius(0)
      .outerRadius(needleRadius)
      .startAngle(0)
      .endAngle(6.3); // >= 2pi

   var dot_gen = d3.svg.arc()
      .innerRadius(0)
      .outerRadius(dotRadius)
      .startAngle(0)
      .endAngle(6.3); // >= 2pi

   var timeline;
   var timeline_g;
   var needle_g;
   var control_g;
   var dot_g;
   var center_field;

   // creates the timeline from scratch
   function render (selection) {
      selection.each( function (data) {
         timeline = d3.select(this);

         timeline_g = timeline.append("g")
            .attr("transform", "translate(" + controlWidth + ",0)");

         var above = timeline_g.append("g")
            .attr("class", "timeline_above")
            .attr("transform", "translate(" + leftMargin + ",0)");
         var below = timeline_g.append("g")
            .attr("class", "timeline_below")
            .attr("transform", "translate(" + leftMargin + "," + (aboveHeight) + ")");
         var center = timeline_g.append("g")
            .attr("class", "timeline_center")
            .attr("transform", "translate(" + leftMargin + "," + (aboveHeight) + ")");
         center_top = timeline_g.append("g")
            .attr("class", "timeline_center_top")
            .attr("transform", "translate(" + leftMargin + "," + (aboveHeight) + ")")

         var baseline = center.append("line")
            .attr("class", "timeline_baseline")
            .attr("x1", 0)
            .attr("x2", length)
            .attr("y1", 0)
            .attr("y2", 0);

         needle_g = center.append("g")
            .attr("transform", "translate(" + scale(currentDate) + ",0)");

         var needle = needle_g.append("path")
            .attr("class", "timeline_needle")
            .attr("d", circle_gen());

         control_g = timeline.append("g")
            .attr("class", "timeline_control_g")
            .attr("transform", "translate(0," + aboveHeight + ")");

         dot_g = center_top.append("g")
            .attr("class", "timeline_dot_g");

         center_field = center_top.append("rect")
            .attr("class", "timeline_center_field")
            .attr("x", 0)
            .attr("y", -centerHeight / 2)
            .attr("width", length)
            .attr("height", centerHeight)
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut)
            .on("click", onClick);

         var ticks = below.append("g")
            .attr("class", "timeline_ticks");

         var labels = below.append("g")
            .attr("class", "timeline_labels");

         ticks.selectAll("line")
            .data(scale.ticks(nTicks))
            .enter()
            .append("line")
            .attr("class", "timeline_tick")
            .attr("x1", scale)
            .attr("x2", scale)
            .attr("y1", 0)
            .attr("y2", centerHeight / 2)

         labels.selectAll("text")
            .data(scale.ticks(nTicks))
            .enter()
            .append("text")
            .attr("class", "timeline_label")
            .attr("x", scale)
            .attr("y", centerHeight / 2 + textSpace + 10)
            .attr("text-anchor", "middle")
            .text(displayFormat);

         // draw events
         var events = above.selectAll(".timeline_event").data(data).enter();
         events = events.append("g")
            .attr("class", "timeline_event")
            .attr("transform", function (d) {
               return "translate(" + scale(d.date) + ",0)";
            });

         events.append("line")
            .attr("class", "timeline_stalk")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", aboveHeight)
            .attr("y2", aboveHeight - (centerHeight / 2));

         events.append("text")
            .attr("class", "timeline_event_text")
            .attr("transform", "translate(0," + (aboveHeight - centerHeight/2 - textSpace) + ")" +
               "rotate(-" + textRotation + ")")
            .text( function (d) { return d.description; } );
      });
   }


   var dot = null;

   function onMouseOver () {
      // get coords and move the dot group
      var x = d3.mouse(this)[0];
      dot_g.attr("transform", "translate(" + (x) + ",0)");

      // create the dot
      dot = dot_g.append("path")
         .attr("id", "timeline_dot")
         .attr("d", dot_gen());

      // register mousemove listener
      center_field.on("mousemove", onMouseMove);
   }

   function onMouseMove () {
      // get coords and move the dot group
      var x = d3.mouse(this)[0];
      dot_g.attr("transform", "translate(" + (x) + ",0)");
   }

   function onMouseOut () {
      // remove the dot
      if (dot) { dot.remove(); }
      dot = null;

      // remove the mousemove listener
      center_field.on("mousemove", null);
   }

   function onClick () {
      var clickedDate = scale.invert(d3.mouse(this)[0]);
      onDateChange(clickedDate);
   }


   var play_control = null,
      pause_control = null;

   render.play = function () {
      // set state
      playing = true;

      // remove play button
      if (play_control) { play_control.remove(); }
      play_control = null;

      // draw pause button
      pause_control = control_g.append("g");
      pause_control.append("rect")
         .attr("class", "timeline_pause_rect")
         .attr("x", 0)
         .attr("y", -15)
         .attr("width", 10)
         .attr("height", 30);
      pause_control.append("rect")
         .attr("class", "timeline_pause_rect")
         .attr("x", 20)
         .attr("y", -15)
         .attr("width", 10)
         .attr("height", 30);
      pause_control.append("rect")
         .attr("class", "timeline_pause_button")
         .attr("x", 0)
         .attr("y", -15)
         .attr("width", 30)
         .attr("height", 30)
         .on("click", render.pause);

      // start the transition
      timeline.transition()
         .duration(15000 * (lastDataDate - currentDate) / (lastDataDate - startDate))
         .ease("linear")
         .tween("year", function () {
            var timeScale = d3.time.scale()
               .domain([currentDate, lastDataDate])
               .range([0, 1]);
            return function (t) {
               return onDateChange(timeScale.invert(t));
            };
         })
         .each("end", render.pause);
   };

   render.pause = function () {
      // set state
         playing = false;

      // remove pause button
      if (pause_control) { pause_control.remove(); }
      pause_control = null;

      // draw play button
      play_control = control_g.append("g");
      play_control.append("path")
         .attr("class", "timeline_play_button")
         .attr("d", "M0 -15 L30 0 L0 15 Z")
         .on("click", render.play);


      // stop the transition
      timeline.transition().duration(0);
   };
      


   render.changeCurrentDate = function (newdate) {
      currentDate = newdate;
      needle_g.attr("transform", "translate(" + scale(currentDate) + ",0)");
   };

   render.onDateChange = function (callback) {
      if (!arguments.length) { return onDateChange; }
      onDateChange = callback;
      return render;
   };

   render.startDate = function () {
      return startDate;
   };

   render.endDate = function () {
      return endDate;
   };

   render.height = function () {
      return aboveHeight + centerHeight + belowHeight;
   };

   render.playing = function () { return playing; };

   render.bounds = function () {
      console.log(timeline.node().getBoundingClientRect());
   }

   return render;
}


// ==================== Stats ====================

function stats () {
   // display variables
   var colWidth = 80;
   var rowHeight = 30;
   var iconWidth = 10;

   // secondary variables (not exposed to user)
   var rowWidth = 4*colWidth;
   var scale = function (d, i) {
      return rowHeight * i;
   }

   var sortCol = 0,
      sortDir = "Increasing",
      sortFun = sortSI;

   // member variables
   var table_root = null;
   var table = null;
   var currentData = null;
   var rows;
   var label_g = [];
   var label_content = ["State", "Obama", "Romney", "Other"];

   // creates the stats table from scratch
   function render (selection) {
      selection.each( function (data) {
         if (table_root === null) {
            table_root = d3.select(this);

            var labels = table_root.append("g")
               .attr("class", "stats_label_row")
               .attr("transform", "translate(0," + rowHeight + ")");

            labels.append("line")
               .attr("class", "stats_label_row_line")
               .attr("x1", 0)
               .attr("x2", rowWidth)
               .attr("y1", 0)
               .attr("y2", 0);

            for (var i=0; i<label_content.length; ++i) {
               label_g[i] = labels.append("g")
                  .attr("class", "stats_label_g")
                  .attr("transform", "translate(" + i*colWidth + ",0)");

               label_g[i].append("text")
                  .attr("class", "stats_label_text")
                  .attr("dy", "-0.5em")
                  .attr("dx", 10)
                  .text(label_content[i]);

               label_g[i].append("rect")
                  .attr("class", "stats_field stats_label_field")
                  .attr("x", 0)
                  .attr("y", -rowHeight)
                  .attr("width", colWidth)
                  .attr("height", rowHeight)
                  .on( "click", (function (i) {
                     return function () {
                        var newdir = sortDir;
                        if (sortCol === i) {
                           if (sortDir === "Increasing") {
                              newdir = "Decreasing";
                           } else {
                              newdir = "Increasing";
                           }
                        }
                        changeSort(i, newdir);
                     }
                  })(i) );
            }

            // draw icon for initial sort
            drawIcon(sortCol, sortDir);

            table = table_root.append("g")
               .attr("transform", "translate(0," + 2*rowHeight + ")");
         }


         currentData = data;
         currentData.sort(sortFun);

         rows = table.selectAll(".stats_row")
            .data(currentData, function (d) { return d.State; });

         // Enter
         var new_rows = rows.enter()
            .append("g")
            .attr("class", "stats_row")
            .attr("id", function (d, i) {
               return "stats_" + d.State.replace(' ', '_');
            })
            .attr("transform", function (d, i) { return "translate(0," + scale(d, i) + ")"; })
            .on("mouseover", function (d) {
               highlight(d.State);
            })
            .on("mouseout", function (d) {
               unhighlight(d.State);
            });

         new_rows.append("rect")
            .attr("class", "stats_row_background")
            .attr("x", 0)
            .attr("y", -rowHeight)
            .attr("width", rowWidth)
            .attr("height", rowHeight);

         new_rows.append("line")
            .attr("class", "stats_row_line")
            .attr("x1", 0)
            .attr("x2", rowWidth)
            .attr("y1", 0)
            .attr("y2", 0);

         new_rows.append("text")
            .attr("class", "stat_label")
            .attr("dy", "-0.5em")
            .attr("dx", 10)
            .text(function (d) { return d.Abbreviation; });

         new_rows.append("text")
            .attr("class", "stat_obama")
            .attr("dy", "-0.5em")
            .attr("dx", 10)
            .attr("x", colWidth)
            .text(function (d) { return formatPercent(d.Obama); });

         new_rows.append("text")
            .attr("class", "stat_romney")
            .attr("dy", "-0.5em")
            .attr("dx", 10)
            .attr("x", 2*colWidth)
            .text(function (d) { return formatPercent(d.Romney); });

         new_rows.append("text")
            .attr("class", "stat_other")
            .attr("dy", "-0.5em")
            .attr("dx", 10)
            .attr("x", 3*colWidth)
            .text(function (d) { return formatPercent(d.Other); });

         new_rows.append("rect")
            .attr("class", "stats_field")
            .attr("x", 0)
            .attr("y", -rowHeight)
            .attr("width", 4*colWidth)
            .attr("height", rowHeight);

         // Update
         rows.select(".stat_obama").text(function (d) { return formatPercent(d.Obama); });
         rows.select(".stat_romney").text(function (d) { return formatPercent(d.Romney); });
         rows.select(".stat_other").text(function (d) { return formatPercent(d.Other); });
         rows.transition()
            .duration(timeline_f.playing() ? 45 : 500)
            .attr("transform", function (d, i) { return "translate(0," + scale(d, i) + ")"; });
      });
   }


   function formatPercent (number) {
      if (number === null || number === undefined) {
         return '?';
      } else {
         return String(number.toFixed(1)) + '%';
      }
   }

   // Sorting Methods

   var sortFunctions = [ { Increasing: sortSI, Decreasing: sortSD },
      { Increasing: sortOI, Decreasing: sortOD },
      { Increasing: sortRI, Decreasing: sortRD },
      { Increasing: sortOtherI, Decreasing: sortOtherD }
   ];

   function changeSort (col, direction) {
      // remove icon from current sort column
      label_g[sortCol].selectAll(".stats_icon").remove();
      label_g[sortCol].select(".stats_label_text")
         .attr("transform", "translate(0,0)");

      // add new icon
      drawIcon(col, direction);

      // change variables
      sortCol = col;
      sortDir = direction;
      sortFun = sortFunctions[sortCol][sortDir];

      // sort rows
      currentData.sort(sortFun);
      table_root.datum(currentData);
      render(table_root);
   }

   function drawIcon (col, direction) {
      label_g[col].select(".stats_label_text")
         .attr("transform", "translate(" + (iconWidth + 5) + ",0)");
      var icon = label_g[col]
         .insert("g")
         .attr("transform", "translate(10, -10)")
         .insert("path", ":first-child")
         .attr("class", "stats_icon")
         .attr("d", "M0 " + (-iconWidth) + "L" + iconWidth + ' ' + (-iconWidth) + "L" + (iconWidth/2) + " 0 Z");
      if (direction === "Increasing") {
         icon.attr("transform", "translate(" + iconWidth + " " + (-iconWidth) + ")rotate(180)");
      }
   }

   function sortSI (a, b) {
      if (a.Abbreviation < b.Abbreviation) { return -1; } return 1;
   }
   function sortSD (a, b) {
      return sortSI(b, a);
   }

   function sortOI (a, b) { return sortPercents(a.Obama, b.Obama, increasing); }
   function sortOD (a, b) { return sortPercents(a.Obama, b.Obama, decreasing); }
   function sortRI (a, b) { return sortPercents(a.Romney, b.Romney, increasing); }
   function sortRD (a, b) { return sortPercents(a.Romney, b.Romney, decreasing); }
   function sortOtherI (a, b) { return sortPercents(a.Other, b.Other, increasing); }
   function sortOtherD (a, b) { return sortPercents(a.Other, b.Other, decreasing); }

   function sortPercents (a, b, comparison) {
      if (a === null) {
         if (b === null) {
            return 0;
         } else {
            return 1;
         }
      } else {
         if (b === null) {
            return -1;
         } else {
            return comparison(a, b);
         }
      }
   }

   function increasing (a, b) { return a <= b ? -1 :  1; }
   function decreasing (a, b) { return a <= b ?  1 : -1; }


   render.width = function (_) {
      return 4*colWidth;
   };

   render.height = function (_) {
      // 50 states + DC + column labels + room for last line
      return 52*rowHeight + 3;
   };


   return render;
}


// ==================== Data Group ====================

function data_group () {
   var topSpace = 0;
   var lineSpacing = 1.4;
   var map = null;

   var monthFormat = d3.time.format("%b");
   var dayFormat = d3.time.format("%d");

   var root;
   var date;
   var state;
   var key;
   var dateSize = 32;
   var stateSize = 32;
   var keyWidth = 6; // measured in multiples of stateSize
   var keyWidthPx = 0;

   function render (selection) {
      selection.each( function () {
         root = d3.select(this);

         date = root.append("g").attr("class", "data_date");
         state = root.append("g").attr("class", "data_state");
         var statename = state.append("text").attr("class", "state_name").attr("font-size", "1.5em");
         var labels = state.append("g").attr("class", "data_state_labels");
         var stats = state.append("g").attr("class", "data_state_stats");
         key = state.append("g").attr("class", "data_state_key");

         dateSize = getFontSize(date);
         dateHeight = 2.4 * dateSize;
         stateSize = getFontSize(state) * lineSpacing;
         keyWidthPx = keyWidth * stateSize;

         date.attr("transform", "translate(0," + topSpace + ")");
         state.attr("transform", "translate(0," + (dateHeight + 1.75 * dateSize) + ")");
         statename.attr("transform", "translate(0," + (1.5 * stateSize) + ")");
         labels.attr("transform", "translate(" + (-3.5*stateSize) + "," + (2*stateSize) + ")");
         stats.attr("transform", "translate(0," + (2*stateSize) + ")");
         key.attr("transform", "translate(" + (-keyWidthPx - 1) + "," + (6 * stateSize) + ")");

         date.append("text")
            .attr("class", "data_month")
            .attr("transform", "translate(0," + dateSize + ")");

         date.append("text")
            .attr("class", "data_day")
            .attr("font-size", "1.5em")
            .attr("transform", "translate(0," + (2.4*dateSize) + ")");


         labels.append("text")
            .attr("class", "state_obama_label")
            .attr("transform", "translate(0," + (stateSize) + ")");
            
         labels.append("text")
            .attr("class", "state_romney_label")
            .attr("transform", "translate(0," + (2*stateSize) + ")");
            
         labels.append("text")
            .attr("class", "state_other_label")
            .attr("transform", "translate(0," + (3*stateSize) + ")");
            

         stats.append("text")
            .attr("class", "state_obama")
            .attr("transform", "translate(0," + (stateSize) + ")");
            
         stats.append("text")
            .attr("class", "state_romney")
            .attr("transform", "translate(0," + (2*stateSize) + ")");
            
         stats.append("text")
            .attr("class", "state_other")
            .attr("transform", "translate(0," + (3*stateSize) + ")");


         var defs = key.append("defs");
         var grad = key.append("linearGradient")
            .attr("id", "key_grad")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
         grad.append("stop")
            .attr("offset", "0%")
            .attr("style", "stop-color:" + map.blue().toString() + "; stop-opacity:1");
         grad.append("stop")
            .attr("offset", "50%")
            .attr("style", "stop-color:" + map.purple().toString() + "; stop-opacity:1");
         grad.append("stop")
            .attr("offset", "100%")
            .attr("style", "stop-color:" + map.red().toString() + "; stop-opacity:1");


      });
   }

   function formatPercent (number) {
      if (number === null || number === undefined) {
         return 'no data';
      } else {
         return String(number.toFixed(1)) + '%';
      }
   }

   render.changeDate = function (date) {
      root.select(".data_month").text(monthFormat(date));
      root.select(".data_day").text(dayFormat(date));
   };

   render.showState = function (data) {
      root.select(".state_name").text(data.State);
      root.select(".state_obama_label").text("Obama");
      root.select(".state_romney_label").text("Romney");
      root.select(".state_other_label").text("Other");
      render.updateState(data);

      key.append("rect")
         .attr("class", "key_rect")
         .attr("x", 0)
         .attr("y", 0)
         .attr("width", 6 * stateSize)
         .attr("height", stateSize)
         .attr("fill", "url(#key_grad)");

      if (data.hasOwnProperty('Index')) {
         var linepos = (1 - map.adjustedIndex(data.Index)) * keyWidthPx;
         key.append("line")
            .attr("class", "key_line")
            .attr("x1", linepos)
            .attr("x2", linepos)
            .attr("y1", 0)
            .attr("y2", stateSize);
      }

      key.append("rect")
         .attr("class", "key_border")
         .attr("x", 0)
         .attr("y", 0)
         .attr("width", 6 * stateSize)
         .attr("height", stateSize)
         .attr("fill", "transparent");

   };

   render.updateState = function (data) {
      root.select(".state_obama").text(formatPercent(data.Obama));
      root.select(".state_romney").text(formatPercent(data.Romney));
      root.select(".state_other").text(formatPercent(data.Other));

      if (data.hasOwnProperty('Index')) {
         var linepos = (1 - map.adjustedIndex(data.Index)) * keyWidthPx;
         root.select(".key_line").attr("x1", linepos).attr("x2", linepos);
      }
   };

   render.hideState = function () {
      root.select(".state_obama_label").text("");
      root.select(".state_romney_label").text("");
      root.select(".state_other_label").text("");
      root.select(".state_name").text("");
      root.select(".state_obama").text("");
      root.select(".state_romney").text("");
      root.select(".state_other").text("");

      root.select(".key_rect").remove();
      root.select(".key_border").remove();
      root.select(".key_line").remove();
   }

   render.map = function (_) {
      if (!arguments.length) { return map; }
      else { map = _; return render; }
   }

   /*
   render.width = function (_) {
      if (!arguments.length) { return width; }
      else { width = _; return render; }
   };

   render.height = function (_) {
      if (!arguments.length) { return height; }
      else { height = _; return render; }
   };
   */

   return render;
}


// ==================== Rendering Function Objects ====================

var timeline_f = timeline();
var map_f = map();
//var key_f = map_key(map_f).height(map_f.height() / 3 - 30);

// stats group
var stats_g = null;

// stats function
var stats_f = stats();

// data function
var data_f = data_group().map(map_f);


// ==================== onload ====================

window.onload = function () {
   // create the svg elements
   var svg = d3.select("#d3_map_timeline").append("svg")
      .attr("id", "map_timeline_svg")
      .attr("width", 1000)
      .attr("height", map_f.height() + timeline_f.height());

   var map_svg = svg.append("g")
      .attr("id", "map_svg")
      .attr("height", map_f.height());

   var data_g = svg.append("g").attr("id", "data_g")
      .attr("transform", "translate(" + svg.attr("width") + ",0)");

   var timeline_svg = svg.append("g")
      .attr("transform", "translate(0," + map_f.height() + ")")
      .attr("height", timeline_f.height())
      .datum(timeline_events);

   var key_g = svg.append("g")
      .attr("transform", "translate(" + svg.attr("width") + "," + (2 * map_f.height() / 3) + ")")
      .attr("class", "map_key");

   // map group
   /*
   var map_g = map_svg.append("g")
      .attr("id", "map");

   // timeline group
   var timeline_g = svg.append("g")
      .attr("id", "timeline")
      .attr("transform", "translate(100,500)")
   */

   // timeline function
   timeline_f.onDateChange( changeDate );

   // stats group
   stats_g = d3.select("#d3_stats").append("svg")
      .attr("width", stats_f.width())
      .attr("height", stats_f.height());
   /*
   stats_g = svg.append("g")
      .attr("id", "stats")
      .attr("transform", "translate(0," + (mapHeight + 100) + ")");
   */

   // get states data
   d3.json("states.json", function(json) {
      // draw map
      map_svg.datum(json.features).call(map_f);
   });

   // draw timeline
   timeline_f(timeline_svg);
   timeline_f.pause();

   // load poll data
   d3.json("poll_data.json", function(json) {
      data = json;
      changeDate(currentDate);
   });

   // make data section
   data_f(data_g);

   // draw map key
   //key_f(key_g);
}

var highlightedState = null;

function changeDate (date) {
   // get the date string we use to index our data
   var datename = lookupFormat(date);

   // update vars
   currentDate = date;
   var currentData = getStats(datename);

   // update the map
   map_f.color(currentData);

   // update the timeline
   timeline_f.changeCurrentDate(currentDate);

   // update the stats
   stats_g.datum(currentData);
   stats_f(stats_g);

   // change text
   data_f.changeDate(date);

   if (highlightedState) {
      data_f.updateState(getStat(highlightedState, datename));
   }
}

function updateStats () {
   var stateData = getStat(currentState, lookupFormat(currentDate));

   d3.select("#date").text(displayFormat(currentDate));
   d3.select("#stat_state").text(stateData.State);

   var obama = stateData.Obama;
   if (obama === null) { obama = "no data"; }
   else { obama = String(obama) + "%"; }

   var romney = stateData.Romney;
   if (romney === null) { romney = "no data"; }
   else { romney = String(romney) + "%"; }

   var other = stateData.Other;
   if (other === null) { other = "no data"; }
   else { other = String(other) + "%"; }

   d3.select("#stat_obama").text(obama);
   d3.select("#stat_romney").text(romney);
   d3.select("#stat_other").text(other);
}

function highlight (state) {
   highlightedState = state;
   var stateid = state.replace(' ', '_');
   d3.select("#map_" + stateid).classed("highlight", true);
   d3.select("#map_svg").selectAll(".state").sort( function (a, b) {
      if (a.properties.name == state) { return 1; }
      if (b.properties.name == state) { return -1; }
      return 0;
   });

   data_f.showState(getStat(state, lookupFormat(currentDate)));
   d3.select("#stats_" + stateid).classed("highlight", true);
}

function unhighlight (state) {
   highlightedState = null;
   var stateid = state.replace(' ', '_');
   d3.select("#map_" + stateid).classed("highlight", false);

   data_f.hideState();
   d3.select("#stats_" + stateid).classed("highlight", false);
}
