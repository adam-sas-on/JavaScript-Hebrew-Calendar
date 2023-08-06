
/* KaluachJS - Kaluach Javascript Hebrew/civil calendar
 *   Version 1.00
 * Copyright (C) 5760,5761 (2000 CE), by Abu Mami and Yisrael Hersch.
 *   All Rights Reserved.
 *   All copyright notices in this script must be left intact.
 * Requires kdate.js - Kaluach Javascript Hebrew date routines
 * Acknowledgment given to scripts by:
 *	 - Tomer and Yehuda Shiran (docjs.com)
 *   - Gordon McComb
 *   - irt.org
 *   - javascripter.net
 * Terms of use:
 *   - Permission will be granted to use this script on personal
 *     web pages. All that's required is that you please ask.
 *     (Of course if you want to send a few dollars, that's OK too :-)
 *   - Use on commercial web sites requires a $50 payment.
 * website: http://www.kaluach.net
 * email: abumami@kaluach.net
 */

$(document).ready(function() {
  KDate.getInstance();
  var otherHolidays = false;
  var jewishHolidays = true;
  var civilHolidays = false;

  var calendarContainer = $('#calendar-container');
  var calendarForm = $('#calendar-form');

  var holidaysSelect = $('#holidays', calendarForm);
  var yearField = $('#year', calendarForm);
  var monthField = $('#month', calendarForm);
  var prevMonthButton = $('#prev-month', calendarForm);
  var nextMonthButton = $('#next-month', calendarForm);
  var prevYearButton = $('#prev-year', calendarForm);
  var nextYearButton = $('#next-year', calendarForm);
  var todayButton = $('#today', calendarForm);

  var isMobile = function() {
    return $('body').is('.mobile');
  };

  /**
   * 	Set events for form inputs for calendar
   * and create one for current year and month.
   */
  var initialize = function() {

    holidaysSelect.change(holidaysSelect_Change);
    todayButton.click(todayButton_Click);
    prevMonthButton.click(prevMonthButton_Click);
    nextMonthButton.click(nextMonthButton_Click);
    prevYearButton.click(prevYearButton_Click);
    nextYearButton.click(nextYearButton_Click);

    yearField.change(yearField_Change);
    monthField.change(monthField_Change);


    selectToday();
  };

  /**
   * 	Update calendar after change of year
   * in form input for year.
   */
  var yearField_Change = function() {
    setCalendarFromMonthYear();
  };

  /**
   * 	Update calendar after change of month
   *  in a <select> list of options.
   */
  var monthField_Change = function() {
    setCalendarFromMonthYear();
  };

  /**
   * 	Update calendar after request for previous year
   * to currently filled in a form.
   */
  var prevYearButton_Click = function() {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();
    y -= 1;

    setCalendar(m, y);
  };

  /**
   * 	Update calendar after request for next year
   * to currently filled in a form.
   */
  var nextYearButton_Click = function() {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();
    y += 1;
    setCalendar(m, y);
  };

  /**
   * 	Update calendar after request for previous month
   * to currently filled in a form.
   */
  var prevMonthButton_Click = function() {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();

    if(m > 0)
      m -= 1;
    else {
      m = 11;
      y -= 1;
    }

    setCalendar(m, y);
  };

  /**
   * 	Update calendar after request for next month
   *  to currently filled in a form.
   */
  var nextMonthButton_Click = function() {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();

    if(m < 11)
      m++;
    else {
      m = 0;
      y++;
    }

    setCalendar(m, y);
  };

  /**
   * 	Update calendar after click of button for current day.
   */
  var todayButton_Click = function () {
    selectToday();
  };

  /**
   *	Update calendar after change of preferred group of holidays to display.
   *  Groups of holidays are listed in form-select as sorted list of options:
   *  "Jewish", "Civil", "All" and option of nothing to display.
   *  Method gets index of option and interprets its value as corresponding category.
   */
  var holidaysSelect_Change = function() {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();
    var h = holidaysSelect.get(0).selectedIndex;
    if(h == 0) {
      jewishHolidays = true;
      civilHolidays = false;
    }
    else if(h == 1) {
      jewishHolidays = false;
      civilHolidays = true;
    }
    else if(h == 2) {
      jewishHolidays = true;
      civilHolidays = true;
    }
    else if(h == 3) {
      jewishHolidays = false;
      civilHolidays = false;
    }

    doCal(m, y);
  }

  /**
   * 	Scrolls to description of clicked day,
   * commonly used in mobile devices.
   */
  var dayCell_Click = function() {
  	var rel = $(this).attr('rel');
  	var relDetail = $('.event-wrapper[rel="' + rel + '"]');
  	if (relDetail.length > 0) {
  		relDetail.get(0).scrollIntoView();
  	}
  };

  function toggleOther(form) {
    otherHolidays = !otherHolidays;
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();
    doCal(m, y);
  }

  /**
   * 	Calculate required properties, create calendar table af month
   * and update it in calendar content block.
   * Make all cells of days clickable (for mobiles) to show details for specific day if it is a holiday or national occasion.
   * @param month {number}: zero-based value of month;
   * @param year: 4-digit value of year
   */
  function doCal(month, year) {
    var ret = calendar(month, year);
    var calendarTable = BuildLuachHTML(ret);
    calendarContainer.empty().append(calendarTable);

    $('td.day').click(dayCell_Click);
  }

  /**
   * 	Get object with year, mont as number from 1 to 12, number of days for month
   * and number from 1 to 7 of column for first day of month (day of week as number from 1 to 7).
   * @param selM {number}: zero-based value of month;
   * @param selY: 4-digit value of year;
   * @returns {{tableCell: number, y, numberOfDays: (*|number), m: *}}
   */
  function calendar(selM, selY) {
    var m = selM + 1;
    var y = selY;
    var d = KDate.getCivMonthLength(m, y);
    var firstOfMonth = new Date (y, selM, 1);
    var startPos = firstOfMonth.getDay() + 1;

    return {y: y, m: m, numberOfDays: d, tableCell: startPos};
  }

  function BuildLuachHTML(parms)  {
    var cellWidth  = 80;			// width of columns in table
    var cellHeight = 55;			// height of day cells calendar
    var hebDate;
    var hebDay;
    var now = new Date();
    var tday = now.getDate();
    var tmonth = now.getMonth();
    var tyear = now.getFullYear();
    if(tyear < 1000)
      tyear += 1900;
    var cMonth = parms.m;
    var cYear = parms.y;
    var monthName = KDate.civMonthName(cMonth);
    var lastDate = KDate.getCivMonthLength(cMonth, cYear);
    var hMonth;
    var hYear;

    // get starting Heb month in civil month
    hebDate = KDate.civToHeb(1, cMonth, cYear);
    var hmS = hebDate.hebMonth;
    hYear = hebDate.hebYear;
    var start = hebDate.monthName + ' ' + hYear;

    // get ending Heb month in civil month
    hebDate = KDate.civToHeb(lastDate, cMonth, cYear);
    var hmE = hebDate.hebMonth;
    hMonth = hebDate.hebMonth;
    hYear = hebDate.hebYear;
    var end = hebDate.monthName + ' ' + hYear;

    var hebSpan;
    // check if start and end Heb months are the same
    if(hmS === hmE)
      hebSpan = start;
    else
      hebSpan = start + ' / ' + end

    var container = $('<div id="calendar-wrapper"></div>');

    var table1 = $('<table class="calendar table-header"></table>');
    var table2 = $('<table class="calendar table-body"></table>');
    var eventsList = $('<div id="calendar-list"></div>');
    var eventsListContent = '';

    var tHead = $('<thead></thead>');
    var tBody = $('<tbody></tbody>');

    var headerRow = $('<tr class="month-header"></tr>');
    var headerCell = $('<th colspan="7"></th>');

    var headerText = '<span class="english">' + monthName + ' ' + cYear + '</span>';
    headerText += '<span class="hebrew">' + hebSpan + '</span>';

    var prevMonthLink = $('<a id="previous-month"></a>').html('&lt;');
    var nextMonthLink = $('<a id="next-month"></a>').html('&gt;');

    prevMonthLink.click(prevMonthButton_Click);
    nextMonthLink.click(nextMonthButton_Click);

    headerCell.html(headerText).append(prevMonthLink).append(nextMonthLink);
    headerRow.append(headerCell);
    tHead.append(headerRow);

    var daysRow = $('<tr class="days-header"></tr>');

    // create first row of table to set column width and specify week day
    for (var dayNum = 0; dayNum < 7; ++dayNum) {
      var dayCell = $('<td></td>');
      dayCell.text(KDate.weekdayName(dayNum));
      daysRow.append(dayCell);
    }

    tHead.append(daysRow);

    var cell = 1
    var cDay = 1
    var row;
    for (row = 1; row <= 6; row++) {

      var weekRow = $('<tr class="week-row row-' + row + '" rel="' + cDay + '"></tr>');

      for (var col = 1; col <= 7; col++) {
        var weekCell = $('<td class="day"></td>').attr('rel', cDay);


        // convert civil date to hebrew
        hebDate = KDate.civToHeb(cDay, cMonth, cYear);
        hebDay = hebDate.hebDay;
        hMonth = hebDate.hebMonth;

        if (cell < parms.tableCell) {
          
        }
        else {

          var moed = "";
          if(jewishHolidays)
            moed = KDate.moed(cDay, cMonth, cYear, hebDay, hMonth, col);
          var holiday = "";
          if(civilHolidays)
            holiday = KDate.holiday(cDay, cMonth, cYear);

          var cellClass = "";
          if((cDay == tday) && (parms.m == (tmonth+1)) && (parms.y == tyear))
            cellClass = "current-day";
          else if (moed != "")
            cellClass = "holiday";
          else if (holiday != "") {
            cellClass = "civil-holiday";
          }

          weekCell.addClass(cellClass);



          var cellContents = '';
          // assemble the contents of our day cell
          cellContents += '<div class="cell-contents">';
          cellContents +=       '<div class="english">';
          cellContents +=           cDay;
          cellContents +=       '</div>';
          cellContents +=       '<div class="hebrew">';
          cellContents +=           hebDay;
          cellContents +=       '</div>';

          var eventDetail = '';
          if (moed != "")
            eventDetail += moed;
          if (moed != "" && holiday != "")
            eventDetail += '<br>';
          if (holiday != "")
            eventDetail += holiday;

          if (!isMobile()) {
            cellContents += '<div class="events">';
            cellContents += eventDetail;
            cellContents += '</div>';
          }
          else {
            if (eventDetail.length > 0) {
              eventsListContent += '<div class="event-wrapper ' + cellClass + '" rel="' + cDay + '">';
              eventsListContent += '<div class="date">';
              eventsListContent += KDate.civMonthName(cMonth) + ' ' + cDay;
              eventsListContent += ' / ';
              eventsListContent += hebDate.monthName + ' ' + hebDay;
              eventsListContent += '</div>';
              eventsListContent += '<div class="event-detail">';
              eventsListContent += eventDetail;
              eventsListContent += '</div>';
              eventsListContent += '</div>';
            }
          }

          cellContents += '</div>';

          weekCell.html(cellContents);

          cDay++;
        }

        weekRow.append(weekCell);

        if (cDay <= lastDate)
          cell++
        else
          break;
      }

      tBody.append(weekRow);

      if(cDay > parms.numberOfDays)
        break;
    }

    table1.append(tHead);
    table2.append(tBody);

    eventsList.html(eventsListContent);

    container.append(table1);
    container.append(table2);
    container.append(eventsList);


    return container;
  }

  /**
   * 	Get value from form input of year.
   * @returns {number}
   */
  var getSelectedYear = function() {
    return parseInt(yearField.val());
  };

  /**
   *	Get selected index of form-select for months;
   * assumption is that <select> list is sorted and January is the first of the list.
   * @returns {number|number|*}
   */
  var getSelectedMonthIndex = function() {
    return monthField.get(0).selectedIndex;
  };

  /**
   * 	Get values from form of year and month
   * and update calendar view.
   */
  var setCalendarFromMonthYear = function () {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();
    setCalendar(m, y);
  }

  /**
   * 	Sets form values of the year and month,
   * create table view of the calendar.
   * @param month: zero-based value of month;
   * @param year: 4 digit value of year;
   */
  var setCalendar = function(month, year) {
    monthField.get(0).selectedIndex = month;
    yearField.val(year);
    doCal(month, year);
  };

  /**
   * Sets values of form to current year and month,
   * create table view of the calendar.
   */
  var selectToday = function () {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth();
    if(y < 1000)
      y += 1900;

    setCalendar(m, y);
  };

  initialize();

});