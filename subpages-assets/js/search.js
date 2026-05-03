// ===================================================
// SEARCH (Google) helpers
// ===================================================
function handleGoogleSearchSubmit(event) {
  // Let the browser submit to Google normally
  return true
}

function clearGoogleSearch() {
  var input = document.getElementById('searchInput')
  if (input) input.value = ''

  var clearBtn = document.getElementById('searchClear')
  if (clearBtn) clearBtn.classList.remove('visible')

  if (input) input.focus()
}

function handleGoogleSearch(value) {
  var clearBtn = document.getElementById('searchClear')
  if (!clearBtn) return

  if (value && value.trim()) {
    clearBtn.classList.add('visible')
  } else {
    clearBtn.classList.remove('visible')
  }
}
