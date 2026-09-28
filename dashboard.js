const dashboardSidebar = document.querySelector('[data-dashboard-sidebar]');
const dashboardOverlay = document.querySelector('[data-sidebar-overlay]');
const dashboardSidebarToggles = document.querySelectorAll('[data-sidebar-toggle]');
let toastTimer;

const closeDashboardSidebar = () => {
  if (dashboardSidebar) {
    dashboardSidebar.classList.remove('is-open');
  }
  if (dashboardOverlay) {
    dashboardOverlay.classList.remove('is-visible');
  }
};

dashboardSidebarToggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    if (dashboardSidebar) {
      dashboardSidebar.classList.add('is-open');
    }
    if (dashboardOverlay) {
      dashboardOverlay.classList.add('is-visible');
    }
  });
});

document.querySelectorAll('[data-sidebar-close]').forEach((button) => {
  button.addEventListener('click', closeDashboardSidebar);
});

if (dashboardOverlay) {
  dashboardOverlay.addEventListener('click', closeDashboardSidebar);
}

document.querySelectorAll('.dashboard-nav a').forEach((link) => {
  link.addEventListener('click', closeDashboardSidebar);
});

document.querySelectorAll('[data-logout]').forEach((button) => {
  button.addEventListener('click', () => {
    window.location.href = 'signin.html?loggedout=1';
  });
});

const closeDropdowns = () => {
  document.querySelectorAll('[data-dropdown-menu]').forEach((menu) => {
    menu.hidden = true;
  });

  document.querySelectorAll('[data-dropdown-trigger]').forEach((trigger) => {
    trigger.setAttribute('aria-expanded', 'false');
  });
};

document.querySelectorAll('[data-dropdown]').forEach((wrap) => {
  const trigger = wrap.querySelector('[data-dropdown-trigger]');
  const menu = wrap.querySelector('[data-dropdown-menu]');

  if (!trigger || !menu) {
    return;
  }

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();

    const willOpen = menu.hidden;
    closeDropdowns();

    if (willOpen) {
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('.dropdown-item')) {
      closeDropdowns();
    }
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-dropdown]')) {
    closeDropdowns();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDropdowns();
  }
});

const showToast = (message) => {
  const toast = document.querySelector('[data-toast]');
  if (!toast) {
    return;
  }

  window.clearTimeout(toastTimer);
  toast.querySelector('[data-toast-message]').textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
};

document.querySelectorAll('[data-filterable]').forEach((region) => {
  const search = region.querySelector('[data-table-search]');
  const filters = Array.from(region.querySelectorAll('[data-filter-table]'));
  const items = Array.from(region.querySelectorAll('[data-search-item]'));
  const emptyState = region.querySelector('[data-filter-empty]');
  const count = region.querySelector('[data-filter-count]');
  const perPage = Number(region.dataset.pageSize || 0);
  const pagerButtons = Array.from(region.querySelectorAll('[data-pager-button]'));
  const pagerCopy = region.querySelector('[data-pager-copy]');
  let currentPage = 1;

  const updateItems = (requestedPage) => {
    const query = (search?.value || '').trim().toLowerCase();
    const activeFilters = filters.filter((filter) => filter.value);
    const matches = items.filter((item) => {
      const matchesSearch = !query || item.dataset.searchText.includes(query);
      const matchesFilters = activeFilters.every((filter) => item.dataset[filter.dataset.filterKey] === filter.value);
      return matchesSearch && matchesFilters;
    });

    const totalPages = perPage ? Math.max(1, Math.ceil(matches.length / perPage)) : 1;
    currentPage = Math.min(Math.max(requestedPage || currentPage, 1), totalPages);

    items.forEach((item) => {
      item.hidden = !matches.includes(item);
    });

    if (perPage) {
      matches.forEach((item, index) => {
        item.hidden = index < (currentPage - 1) * perPage || index >= currentPage * perPage;
      });
    }

    if (count) {
      count.textContent = `${matches.length} ${matches.length === 1 ? 'item' : 'items'}`;
    }

    if (pagerCopy) {
      const first = matches.length ? (currentPage - 1) * perPage + 1 : 0;
      const last = Math.min(currentPage * perPage, matches.length);
      pagerCopy.textContent = `Showing ${first}-${last} of ${matches.length}`;
    }

    pagerButtons.forEach((button) => {
      const target = button.dataset.pagerButton;
      const isNumber = /^\d+$/.test(target);

      if (isNumber) {
        const page = Number(target);
        button.hidden = page > totalPages;
        button.classList.toggle('active', page === currentPage);
        button.setAttribute('aria-current', page === currentPage ? 'page' : 'false');
        return;
      }

      button.disabled = target === 'prev' ? currentPage === 1 : currentPage === totalPages;
    });

    if (emptyState) {
      const isEmpty = matches.length === 0;
      emptyState.classList.toggle('is-visible', isEmpty);
      emptyState.hidden = !isEmpty;
    }
  };

  if (search) {
    search.addEventListener('input', () => updateItems(1));
  }

  filters.forEach((filter) => filter.addEventListener('change', () => updateItems(1)));

  pagerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.pagerButton;
      if (target === 'prev') {
        updateItems(currentPage - 1);
        return;
      }
      if (target === 'next') {
        updateItems(currentPage + 1);
        return;
      }
      updateItems(Number(target));
    });
  });

  updateItems(1);
});

document.querySelectorAll('[data-chip-group]').forEach((group) => {
  const key = group.dataset.chipGroup;
  const chips = Array.from(group.querySelectorAll('[data-chip]'));
  const items = Array.from(document.querySelectorAll(`[data-chip-key="${key}"]`));

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');

      const value = chip.dataset.chip;
      items.forEach((item) => {
        item.hidden = value !== 'all' && item.dataset[key] !== value;
      });
    });
  });
});

document.querySelectorAll('[data-signal-filter]').forEach((filterButton) => {
  filterButton.addEventListener('click', () => {
    document.querySelectorAll('[data-signal-filter]').forEach((button) => button.classList.remove('active'));
    filterButton.classList.add('active');

    const filter = filterButton.dataset.signalFilter;
    document.querySelectorAll('[data-signal-row]').forEach((row) => {
      const status = row.dataset.status;
      const severity = row.dataset.severity;
      const isVisible = filter === 'all' || (filter === 'open' && status !== 'resolved') || (filter === 'resolved' && status === 'resolved') || (filter === 'priority' && severity === 'high');
      row.hidden = !isVisible;
    });
  });
});

document.querySelectorAll('[data-signal-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const row = button.closest('[data-signal-row]');
    const status = row?.querySelector('[data-signal-status]');
    if (!row || !status) {
      return;
    }

    const action = button.dataset.signalAction;
    if (action === 'acknowledge') {
      row.dataset.status = 'acknowledged';
      status.className = 'dashboard-status watch';
      status.textContent = 'Acknowledged';
      button.remove();
      showToast('Signal acknowledged and added to your review queue.');
    }

    if (action === 'resolve') {
      row.dataset.status = 'resolved';
      status.className = 'dashboard-status resolved';
      status.textContent = 'Resolved';
      button.remove();
      showToast('Signal marked as resolved.');
    }
  });
});

document.querySelectorAll('[data-settings-tab]').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[data-settings-tab]').forEach((button) => button.classList.remove('active'));
    document.querySelectorAll('[data-settings-panel]').forEach((panel) => {
      panel.hidden = panel.id !== tab.dataset.settingsTab;
    });
    tab.classList.add('active');
  });
});

document.querySelectorAll('[data-tab-target]').forEach((tab) => {
  tab.addEventListener('click', () => {
    const group = tab.dataset.tabTarget;
    document.querySelectorAll(`[data-tab-target="${group}"]`).forEach((button) => button.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll(`[data-tab-panel="${group}"]`).forEach((panel) => {
      panel.hidden = panel.dataset.tabName !== tab.dataset.tabName;
    });
  });
});

document.querySelectorAll('[data-segmented] button').forEach((button) => {
  button.addEventListener('click', () => {
    const group = button.parentElement;
    group.querySelectorAll('button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

document.querySelectorAll('[data-toggle]').forEach((toggle) => {
  toggle.setAttribute('aria-pressed', String(toggle.classList.contains('active')));
  toggle.addEventListener('click', () => {
    const isActive = toggle.classList.toggle('active');
    toggle.setAttribute('aria-pressed', String(isActive));
  });
});

const demoErrorPage = 'error.html';

document.querySelectorAll('[data-demo-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.href = demoErrorPage;
  });
});

document.querySelectorAll('[data-demo-action]').forEach((button) => {
  button.addEventListener('click', () => {
    window.location.href = demoErrorPage;
  });
});

document.querySelectorAll('[data-global-search]').forEach((input) => {
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && input.value.trim()) {
      window.location.href = `patients.html?query=${encodeURIComponent(input.value.trim())}`;
    }
  });
});

const initialSearchQuery = new URLSearchParams(window.location.search).get('query');
const initialTableSearch = document.querySelector('[data-table-search]');
if (initialSearchQuery && initialTableSearch) {
  initialTableSearch.value = initialSearchQuery;
  initialTableSearch.dispatchEvent(new Event('input'));
}

const welcomeFromSignIn = new URLSearchParams(window.location.search).get('welcome');

const readStoredValue = (key) => {
  try {
    return window.sessionStorage.getItem(key) || '';
  } catch (error) {
    return '';
  }
};

const activeDashboard = readStoredValue('clarityDashboard');
const activeUserEmail = readStoredValue('clarityUserEmail');

const activeDashboardLabels = {
  admin: 'Admin',
  doctor: 'Doctor'
};

const activeDashboardLabel = activeDashboardLabels[activeDashboard] || '';

if (activeDashboardLabel) {
  document.querySelectorAll('[data-dashboard-label]').forEach((label) => {
    label.textContent = activeDashboardLabel;
  });
}

if (activeUserEmail) {
  document.querySelectorAll('[data-user-email]').forEach((label) => {
    label.textContent = activeUserEmail;
  });
}

if (welcomeFromSignIn === '1') {
    showToast(activeDashboardLabel ? `Signed in. Opening your ${activeDashboardLabel.toLowerCase()} workspace.` : 'Welcome back. Your Clarity workspace is ready.');
}

const triageAcuityOrder = ['routine', 'elevated', 'urgent', 'critical'];

const triageAcuityLabels = {
  critical: 'Critical',
  urgent: 'Urgent',
  elevated: 'Elevated',
  routine: 'Routine'
};

document.querySelectorAll('[data-triage-board]').forEach((board) => {
  const refreshTriageTotals = () => {
    const cards = Array.from(board.querySelectorAll('[data-triage-card]'));

    board.querySelectorAll('[data-band-count]').forEach((badge) => {
      badge.textContent = cards.filter((card) => card.dataset.band === badge.dataset.bandCount).length;
    });

    board.querySelectorAll('[data-acuity-total]').forEach((badge) => {
      badge.textContent = cards.filter((card) => card.dataset.acuity === badge.dataset.acuityTotal).length;
    });
  };

  board.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-triage-escalate]');
    if (!trigger) {
      return;
    }

    const card = trigger.closest('[data-triage-card]');
    const current = card.dataset.acuity;
    const next = triageAcuityOrder[Math.min(triageAcuityOrder.indexOf(current) + 1, triageAcuityOrder.length - 1)];

    if (next === current) {
      showToast(`${card.dataset.patient} is already at the highest acuity band.`);
      return;
    }

    card.dataset.acuity = next;

    const chip = card.querySelector('[data-triage-acuity]');
    if (chip) {
      chip.textContent = triageAcuityLabels[next];
    }

    const cell = board.querySelector(`[data-acuity-cell="${next}-${card.dataset.band}"]`);
    if (cell) {
      cell.appendChild(card);
    }

    refreshTriageTotals();

    const search = board.closest('[data-filterable]')?.querySelector('[data-table-search]');
    if (search) {
      search.dispatchEvent(new Event('input'));
    }

    showToast(`${card.dataset.patient} escalated to ${triageAcuityLabels[next]}.`);
  });

  refreshTriageTotals();
});
