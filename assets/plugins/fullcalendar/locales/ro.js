FullCalendar.globalLocales.push(function () {
  'use strict';

  var ro = {
    code: "ro",
    week: {
      dow: 1,
      doy: 7
    },
    buttonText: {
      prev: "precedentă",
      next: "următoare",
      today: "Azi",
      month: "Lună",
      week: "Săptămână",
      day: "Zi",
      list: "Agendă"
    },
    weekText: "Săpt",
    allDayText: "Toată ziua",
    moreLinkText: function(n) {
      return "+alte " + n;
    },
    noEventsText: "Nu există evenimente de afișat"
  };

  return ro;

}());
