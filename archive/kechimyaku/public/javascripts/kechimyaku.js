function enablePopovers() {
  $('[data-toggle="popover"]').popover();
}

function enableSearch() {

  $('#search .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'teachers',
    source: substringMatcher(teachers)
  });
}

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, matchStrings, substringRegex;

    // an array that will be populated with substring matches
    matches = [];
    matchStrings = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str.master.name)) {
        matches.push(str);
      }
    });

    $.each(matches, function(i, o) {
      matchStrings.push(o.master.name)
    });

    if (matches.length > 0) {
      treeFunctions.centerNode(matches[0]);      
    }

    cb(matchStrings);
  };
};

