// Test jQuery and search input
console.log('=== Kechimyaku.js loaded ===');
console.log('jQuery loaded:', typeof $ !== 'undefined');
console.log('jQuery version:', $.fn.jquery);
console.log('Search input found:', $('#search').length);
console.log('Search input value:', $('#search').val());

function enablePopovers() {
  $('[data-toggle="popover"]').popover();
}

function enableSearch() {
  console.log('=== enableSearch called ===');
  console.log('teachers data:', teachers);
  console.log('teachers length:', teachers ? teachers.length : 'undefined');
  console.log('treeFunctions:', treeFunctions);
  console.log('Search input exists:', $('#search').length > 0);
  
  // Wait for teachers data to be available
  if (typeof teachers === 'undefined' || teachers.length === 0) {
    console.log('Teachers data not ready, retrying...');
    setTimeout(enableSearch, 500);
    return;
  }

  console.log('Initializing custom search with', teachers.length, 'teachers');
  
  // Check if search input exists
  if ($('#search').length === 0) {
    console.error('Search input not found!');
    return;
  }
  
  // Create search dropdown container
  var searchContainer = $('#search').parent();
  console.log('Search container:', searchContainer);
  
  if (searchContainer.find('.search-dropdown').length === 0) {
    console.log('Creating search dropdown');
    searchContainer.append('<div class="search-dropdown absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 hidden max-h-60 overflow-y-auto"></div>');
  }
  
  var dropdown = searchContainer.find('.search-dropdown');
  console.log('Dropdown element:', dropdown);
  
  // Handle input events
  $('#search').off('input focus blur').on('input focus', function() {
    console.log('Search input event triggered');
    var query = $(this).val().toLowerCase();
    console.log('Search query:', query);
    
    if (query.length < 1) {
      dropdown.addClass('hidden');
      return;
    }
    
    // Find matches
    var matches = [];
    $.each(teachers, function(i, teacher) {
      if (teacher.master && teacher.master.name && teacher.master.name.toLowerCase().indexOf(query) !== -1) {
        matches.push(teacher);
      }
    });
    
    console.log('Found matches:', matches.length);
    
    if (matches.length > 0) {
      // Build dropdown content
      var dropdownContent = '';
      $.each(matches.slice(0, 10), function(i, teacher) { // Limit to 10 results
        dropdownContent += '<div class="search-result px-3 py-2 hover:bg-accent cursor-pointer border-b border-border last:border-b-0" data-teacher-id="' + teacher.master.id + '">' + 
                          '<div class="font-medium">' + teacher.master.name + '</div>' +
                          '</div>';
      });
      
      dropdown.html(dropdownContent).removeClass('hidden');
      console.log('Dropdown shown with', matches.length, 'results');
    } else {
      dropdown.addClass('hidden');
      console.log('No matches found, hiding dropdown');
    }
  }).on('blur', function() {
    // Hide dropdown after a short delay to allow clicking
    setTimeout(function() {
      dropdown.addClass('hidden');
    }, 200);
  });
  
  // Handle result selection
  dropdown.off('click').on('click', '.search-result', function() {
    console.log('Search result clicked');
    var teacherId = $(this).data('teacher-id');
    var selectedTeacher = null;
    
    // Find the selected teacher
    $.each(teachers, function(i, teacher) {
      if (teacher.master.id == teacherId) {
        selectedTeacher = teacher;
        return false; // break the loop
      }
    });
    
    if (selectedTeacher) {
      console.log('Selected teacher:', selectedTeacher);
      $('#search').val(selectedTeacher.master.name);
      dropdown.addClass('hidden');
      
      // Center on the selected node
      if (treeFunctions && treeFunctions.centerNode) {
        console.log('Centering on selected teacher');
        treeFunctions.centerNode(selectedTeacher, true);
      } else {
        console.log('treeFunctions.centerNode not available');
      }
    }
  });
  
  console.log('Custom search initialized successfully');
}

// Initialize when document is ready
$(document).ready(function() {
  console.log('=== Document ready ===');
  console.log('jQuery version:', $.fn.jquery);
  console.log('Search input exists:', $('#search').length > 0);
  
  // Wait for the tree to load and populate teachers data
  setTimeout(function() {
    console.log('=== Timeout reached, initializing search ===');
    enableSearch();
    enablePopovers();
  }, 2000); // Increased timeout to ensure tree data is loaded
});

// Also try to initialize search when treeFunctions becomes available
function checkTreeReady() {
  console.log('=== Checking tree readiness ===');
  console.log('treeFunctions:', treeFunctions);
  console.log('teachers:', teachers);
  
  if (typeof treeFunctions !== 'undefined' && treeFunctions.root) {
    console.log('Tree functions available, initializing search');
    enableSearch();
  } else {
    console.log('Tree functions not ready, retrying...');
    setTimeout(checkTreeReady, 500);
  }
}

// Start checking for tree readiness
setTimeout(checkTreeReady, 1000);

// Modern accessible dropdown typeahead for Zen Teachers search
$(document).ready(function() {
  const $input = $('#search');
  const $container = $input.parent();
  let $dropdown = $container.find('.search-dropdown');
  if ($dropdown.length === 0) {
    $dropdown = $('<div class="search-dropdown absolute left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 hidden max-h-60 overflow-y-auto" role="listbox" aria-label="Search suggestions"></div>');
    $container.append($dropdown);
  }
  let results = [];
  let activeIndex = -1;

  function renderDropdown(matches) {
    if (!matches.length) {
      $dropdown.html('').addClass('hidden');
      return;
    }
    let html = '';
    matches.forEach((teacher, i) => {
      html += `<div class="search-result px-3 py-2 hover:bg-accent cursor-pointer border-b border-border last:border-b-0 flex items-center" role="option" tabindex="-1" data-index="${i}" data-teacher-id="${teacher.master.id}">
        <span class="font-medium">${teacher.master.name}</span>
      </div>`;
    });
    $dropdown.html(html).removeClass('hidden');
  }

  function closeDropdown() {
    $dropdown.addClass('hidden');
    activeIndex = -1;
  }

  function openDropdown() {
    if (results.length) $dropdown.removeClass('hidden');
  }

  function setActive(idx) {
    $dropdown.children().removeClass('bg-accent text-accent-foreground').attr('aria-selected', 'false');
    if (idx >= 0 && idx < results.length) {
      $dropdown.children().eq(idx).addClass('bg-accent text-accent-foreground').attr('aria-selected', 'true').focus();
      activeIndex = idx;
    } else {
      activeIndex = -1;
    }
  }

  $input.on('input focus', function(e) {
    const query = $input.val().toLowerCase();
    if (!query) {
      closeDropdown();
      return;
    }
    results = (window.teachers || []).filter(t => t.master && t.master.name && t.master.name.toLowerCase().includes(query)).slice(0, 10);
    renderDropdown(results);
    openDropdown();
    setActive(-1);
  });

  $input.on('keydown', function(e) {
    if ($dropdown.hasClass('hidden')) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(activeIndex + 1 >= results.length ? 0 : activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(activeIndex - 1 < 0 ? results.length - 1 : activeIndex - 1);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < results.length) {
        selectResult(activeIndex);
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  $dropdown.on('mousedown', '.search-result', function(e) {
    // Use mousedown to prevent blur before click
    const idx = parseInt($(this).data('index'));
    selectResult(idx);
  });

  $input.on('blur', function() {
    setTimeout(closeDropdown, 150);
  });

  function selectResult(idx) {
    const teacher = results[idx];
    if (!teacher) return;
    $input.val(teacher.master.name);
    closeDropdown();
    if (window.treeFunctions && typeof window.treeFunctions.centerNode === 'function') {
      window.treeFunctions.centerNode(teacher, true);
    }
  }
});

