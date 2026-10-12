/* CareerHub - script.js
   Sections: 1 Elements, 2 State, 3 Helpers, 4 Filters, 5 Building cards,
   6 Showing things, 7 Popups, 8 Forms, 9 Clicks, 10 Theme, 11 Start */

const jobsContainer = document.getElementById("jobs-container");
const savedJobsContainer = document.getElementById("saved-jobs-container");
const applicationsContainer = document.getElementById("applications-container");
const applicationSummary = document.getElementById("application-summary");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const typeFilter = document.getElementById("type-filter");
const locationFilter = document.getElementById("location-filter");
const sortFilter = document.getElementById("sort-filter");
const clearFiltersButton = document.getElementById("clear-filters");
const categoryTabs = document.querySelector(".category-tabs");
const resultsCount = document.getElementById("results-count");
const loadMoreButton = document.getElementById("load-more");

const jobModal = document.getElementById("job-modal");
const jobDetails = document.getElementById("job-details");
const closeModalButton = document.getElementById("close-modal");

const applicationModal = document.getElementById("application-modal");
const applicationForm = document.getElementById("application-form");
const applicationJobTitle = document.getElementById("application-job-title");
const applicantName = document.getElementById("applicant-name");
const applicantEmail = document.getElementById("applicant-email");
const coverMessage = document.getElementById("cover-message");
const coverCounter = document.getElementById("cover-counter");
const resumeFile = document.getElementById("resume-file");
const resumeInfo = document.getElementById("resume-info");
const formMessage = document.getElementById("form-message");
const closeApplicationButton = document.getElementById("close-application");

const authModal = document.getElementById("auth-modal");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginTab = document.getElementById("auth-login-tab");
const registerTab = document.getElementById("auth-register-tab");
const closeAuthButton = document.getElementById("close-auth");
const loginMessage = document.getElementById("login-message");
const registerMessage = document.getElementById("register-message");

const loginGate = document.getElementById("login-gate");
const loginButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");
const userMenu = document.getElementById("user-menu");
const userNameElement = document.getElementById("user-name");
const logoutButton = document.getElementById("logout-button");
const savedCountElement = document.getElementById("saved-count");
const applicationsCountElement = document.getElementById("applications-count");
const savedSectionCountElement = document.getElementById("saved-section-count");
const applicationSectionCountElement = document.getElementById("application-section-count");

const toast = document.getElementById("toast");
const motionToggle = document.getElementById("motion-toggle");
const themeToggle = document.getElementById("theme-toggle");
const navLinks = document.getElementById("nav-links");
const backToTop = document.getElementById("back-to-top");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const applicationStages = ["Submitted", "Under Review", "Interview", "Offer"];
const requiredApplicationFields = ["applicationId", "jobId", "jobTitle", "company", "name", "email", "message", "appliedDate"];


let savedJobIds = [];
let applications = [];
let users = [];
let currentUser = null;
let selectedJob = null;
let detailsJob = null;
let selectedCategory = "All";
let visibleJobLimit = 6;
let pendingAction = null;
let toastTimer = 0;
let nextApplicationNumber = Date.now();
let storageWarning = false;
let statsAnimated = false;
let statTimers = [];


function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("Could not read browser storage.", error);
    storageWarning = true;
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("Could not save browser data.", error);
    return false;
  }
}


function writeText(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn("Could not save a browser setting.", error);
    return false;
  }
}

function readStoredArray(key) {
  const storedValue = readStorage(key);
  if (storedValue === null) return [];
  try {
    const parsedValue = JSON.parse(storedValue);
    if (Array.isArray(parsedValue)) return parsedValue;
  } catch (error) {
    console.warn("Found unreadable saved data.", error);
  }
  storageWarning = true;
  return [];
}

function escapeHTML(value) {
  const text = String(value);
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function splitSkills(skills) {
  const parts = skills.split(",");
  const cleanSkills = [];
  for (let i = 0; i < parts.length; i++) {
    const skill = parts[i].trim();
    if (skill) cleanSkills.push(skill);
  }
  return cleanSkills;
}

function isValidEmail(email) {
  const atPosition = email.indexOf("@");
  const dotPosition = email.lastIndexOf(".");
  if (email === "" || atPosition <= 0) return false;
  if (atPosition !== email.lastIndexOf("@")) return false;
  if (dotPosition <= atPosition + 1 || dotPosition === email.length - 1) return false;
  if (email.indexOf(" ") !== -1 || email.indexOf("..") !== -1) return false;
  return true;
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getJobById(jobId) {
  if (typeof jobs === "undefined") return null;
  for (let i = 0; i < jobs.length; i++) {
    if (jobs[i].id === jobId) return jobs[i];
  }
  return null;
}

function getApplicationById(applicationId) {
  for (let i = 0; i < applications.length; i++) {
    if (applications[i].applicationId === applicationId) return applications[i];
  }
  return null;
}


function isJobSaved(jobId) {
  return savedJobIds.indexOf(jobId) !== -1;
}


function hasApplied(jobId) {
  for (let i = 0; i < applications.length; i++) {
    if (applications[i].jobId === jobId) return true;
  }
  return false;
}

function savedJobsKey() {
  return "careerHubSavedJobs-" + currentUser.email;
}

function applicationsKey() {
  return "careerHubApplications-" + currentUser.email;
}

function isGoodApplication(application) {
  if (!application || typeof application !== "object") return false;
  for (let i = 0; i < requiredApplicationFields.length; i++) {
    if (typeof application[requiredApplicationFields[i]] !== "string") return false;
  }
  return true;
}


function loadUsers() {
  const values = readStoredArray("careerHubUsers");
  users = [];
  for (let i = 0; i < values.length; i++) {
    const user = values[i];
    if (user && typeof user.name === "string" && typeof user.email === "string" && typeof user.password === "string") {
      users.push(user);
    }
  }
}

function loadCurrentUser() {
  const email = readStorage("careerHubCurrentUser");
  currentUser = null;
  for (let i = 0; i < users.length; i++) {
    if (email && users[i].email === email) currentUser = users[i];
  }
}

function loadSavedJobs() {
  savedJobIds = [];
  if (!currentUser) return;
  const values = readStoredArray(savedJobsKey());
  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] === "string") savedJobIds.push(values[i]);
  }
}


function loadApplications() {
  applications = [];
  if (!currentUser) return;
  const values = readStoredArray(applicationsKey());
  for (let i = 0; i < values.length; i++) {
    const application = values[i];
    if (!isGoodApplication(application)) continue;
    if (applicationStages.indexOf(application.status) === -1) application.status = "Submitted";
    applications.push(application);
  }
}


function createApplicationId() {
  const applicationId = "application-" + nextApplicationNumber;
  nextApplicationNumber += 1;
  return applicationId;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(hideToast, 2800);
}


function hideToast() {
  toast.classList.remove("is-visible");
}


function jobMatchesFilters(job) {
  const searchText = searchInput.value.trim().toLowerCase();
  if (searchText) {
    const inTitle = job.title.toLowerCase().indexOf(searchText) !== -1;
    const inCompany = job.company.toLowerCase().indexOf(searchText) !== -1;
    const inSkills = job.skills.toLowerCase().indexOf(searchText) !== -1;
    if (!inTitle && !inCompany && !inSkills) return false;
  }
  if (typeFilter.value !== "All Types" && job.type !== typeFilter.value) return false;
  if (locationFilter.value !== "All Locations" && job.location !== locationFilter.value) return false;
  if (selectedCategory !== "All" && job.category !== selectedCategory) return false;
  return true;
}

function compareTitle(firstJob, secondJob) {
  return firstJob.title.localeCompare(secondJob.title);
}

function compareCompany(firstJob, secondJob) {
  return firstJob.company.localeCompare(secondJob.company);
}


function compareNewest(firstJob, secondJob) {
  return new Date(secondJob.postedAt) - new Date(firstJob.postedAt);
}


function getMatchingJobs() {
  const matchingJobs = [];
  if (typeof jobs === "undefined") return matchingJobs;

  for (let i = 0; i < jobs.length; i++) {
    if (jobMatchesFilters(jobs[i])) matchingJobs.push(jobs[i]);
  }

  if (sortFilter.value === "title") matchingJobs.sort(compareTitle);
  else if (sortFilter.value === "company") matchingJobs.sort(compareCompany);
  else if (sortFilter.value === "newest") matchingJobs.sort(compareNewest);
  return matchingJobs;
}

function clearFilters() {
  searchInput.value = "";
  typeFilter.value = "All Types";
  locationFilter.value = "All Locations";
  sortFilter.value = "default";
  selectedCategory = "All";
  updateCategoryTabs(false);
  renderJobs(true, false);
}

function updateCategoryTabs(focusTab) {
  const tabs = categoryTabs.querySelectorAll("[data-category]");
  for (let i = 0; i < tabs.length; i++) {
    const selected = tabs[i].dataset.category === selectedCategory;
    tabs[i].classList.toggle("is-active", selected);
    if (focusTab && selected) tabs[i].focus();
  }
}


function buildSkillChips(job, clickable) {
  const skills = splitSkills(job.skills);
  let markup = "";
  for (let i = 0; i < skills.length; i++) {
    if (clickable) {
      markup += `<button type="button" class="skill-chip" data-action="search-skill" data-skill="${escapeHTML(skills[i])}">${escapeHTML(skills[i])}</button>`;
    } else {
      markup += `<span class="skill-chip">${escapeHTML(skills[i])}</span>`;
    }
  }
  return markup;
}


function buildSaveIconButton(job) {
  const saved = isJobSaved(job.id);
  const label = (saved ? "Remove from saved: " : "Save job: ") + job.title;
  return `<button type="button" class="save-icon-button${saved ? " is-saved" : ""}" data-action="toggle-saved" data-job-id="${escapeHTML(job.id)}" aria-pressed="${saved}" aria-label="${escapeHTML(label)}" title="Save job">
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z"></path></svg>
    </button>`;
}

function buildCardButtons(job, savedView) {
  const id = escapeHTML(job.id);
  const applied = hasApplied(job.id);
  const applyText = applied ? "Applied ✓" : (savedView ? "Apply" : "Apply Now");
  const applyButton = `<button type="button" class="apply-button" data-action="apply" data-job-id="${id}"${applied ? " disabled" : ""}>${applyText}</button>`;
  const detailsButton = `<button type="button" class="details-button" data-action="details" data-job-id="${id}">View Details</button>`;

  if (savedView) {
    const removeButton = `<button type="button" class="remove-saved-button" data-action="remove-saved" data-job-id="${id}">Remove</button>`;
    return removeButton + detailsButton + applyButton;
  }
  return applyButton + detailsButton;
}

function buildJobCard(job, savedView) {
  const cardClass = savedView ? "saved-job-card" : "job-card";
  const newBadge = job.isNew ? '<span class="new-badge">New</span>' : "";
  const saveButton = savedView ? "" : buildSaveIconButton(job);

  return `<article class="${cardClass}" data-job-id="${escapeHTML(job.id)}">
    <div class="job-badges"><div class="job-badge-group"><span class="job-type">${escapeHTML(job.type)}</span>${newBadge}</div>${saveButton}</div>
    <h3>${escapeHTML(job.title)}</h3>
    <p class="job-company">${escapeHTML(job.company)}</p>
    <p class="job-location">${escapeHTML(job.location)}</p>
    <div class="job-skill-list" aria-label="Skills">${buildSkillChips(job, true)}</div>
    <p class="job-pay">${escapeHTML(job.salary)}</p>
    <p class="job-posted">Posted ${escapeHTML(job.postedDate)}</p>
    <div class="card-buttons">${buildCardButtons(job, savedView)}</div>
  </article>`;
}

function buildEmptyState(heading, copy, showClear) {
  let clearButton = "";
  if (showClear) {
    clearButton = '<br><button type="button" class="clear-filters-button" data-action="clear-filters">Clear filters</button>';
  }
  return `<div class="empty-state"><div><span class="empty-icon" aria-hidden="true">⌕</span><strong>${escapeHTML(heading)}</strong><span>${escapeHTML(copy)}</span>${clearButton}</div></div>`;
}


function buildStepper(currentStage) {
  let markup = "";
  for (let i = 0; i < applicationStages.length; i++) {
    const complete = i <= currentStage ? " is-complete" : "";
    markup += `<span class="step-status${complete}">${applicationStages[i]}</span>`;
  }
  return markup;
}

function buildResumeText(application) {
  if (!application.resumeName) return "not provided";
  const size = Number(application.resumeSize) || 0;
  return escapeHTML(application.resumeName) + " (" + formatFileSize(size) + ")";
}


function buildApplicationCard(application) {
  const status = application.status || "Submitted";
  let currentStage = applicationStages.indexOf(status);
  if (currentStage < 0) currentStage = 0;
  const id = escapeHTML(application.applicationId);

  return `<article class="application-card" data-application-id="${id}">
    <div class="application-card-heading"><div><h3>${escapeHTML(application.jobTitle)}</h3><p class="application-company">${escapeHTML(application.company)}</p></div><span class="status-badge">${escapeHTML(status)}</span></div>
    <p class="application-date">Applied ${escapeHTML(application.appliedDate)}</p>
    <div class="application-stepper" role="img" aria-label="Application progress: ${escapeHTML(status)}">${buildStepper(currentStage)}</div>
    <details class="application-details"><summary>Show details</summary><p><strong>Applicant:</strong> ${escapeHTML(application.name)} · ${escapeHTML(application.email)}</p><p><strong>Cover message:</strong> ${escapeHTML(application.message)}</p><p><strong>Resume:</strong> ${buildResumeText(application)}</p></details>
    <div class="application-actions"><button type="button" class="remove-application-button" data-action="remove-application" data-application-id="${id}">Withdraw</button></div>
  </article>`;
}


function buildJobDetails(job) {
  const saved = isJobSaved(job.id);
  const id = escapeHTML(job.id);
  let applyButton = '<button type="button" class="apply-button" disabled>Applied ✓</button>';
  if (!hasApplied(job.id)) {
    applyButton = `<button type="button" class="apply-button" data-action="apply" data-job-id="${id}">Apply Now</button>`;
  }

  return `<h2 id="job-modal-title">${escapeHTML(job.title)}</h2>
    <div class="job-detail-meta"><p><strong>Company</strong>${escapeHTML(job.company)}</p><p><strong>Location</strong>${escapeHTML(job.location)}</p><p><strong>Type</strong>${escapeHTML(job.type)}</p><p><strong>Category</strong>${escapeHTML(job.category)}</p></div>
    <div class="job-detail-skills"><strong>Skills</strong><div class="job-skill-list">${buildSkillChips(job, false)}</div></div>
    <p class="job-detail-description"><strong>About this role</strong>${escapeHTML(job.description)}</p>
    <div class="job-detail-meta"><p><strong>Salary</strong>${escapeHTML(job.salary)}</p><p><strong>Posted</strong>${escapeHTML(job.postedDate)}</p></div>
    <div class="job-detail-actions">${applyButton}<button type="button" class="save-button${saved ? " is-saved" : ""}" data-action="toggle-saved" data-job-id="${id}" aria-pressed="${saved}">${saved ? "Saved" : "Save Job"}</button></div>`;
}


function updateCountBadges() {
  savedCountElement.textContent = String(savedJobIds.length);
  savedSectionCountElement.textContent = String(savedJobIds.length);
  applicationsCountElement.textContent = String(applications.length);
  applicationSectionCountElement.textContent = String(applications.length);
}


function updateNavbar() {
  const loggedIn = currentUser !== null;
  document.body.classList.toggle("logged-out", !loggedIn);
  loginButton.hidden = loggedIn;
  registerButton.hidden = loggedIn;
  userMenu.hidden = !loggedIn;
  if (loggedIn) {
    const firstName = currentUser.name.trim().split(" ")[0];
    userNameElement.textContent = firstName;
  }
}

function renderJobs(resetLimit, focusNewCard) {
  const savedY = window.scrollY;
  if (resetLimit) visibleJobLimit = 6;


  if (typeof jobs === "undefined") {
    jobsContainer.innerHTML = buildEmptyState("Job listings are unavailable", "Please make sure jobs.js is loaded before script.js.", false);
    resultsCount.textContent = "Job listings are unavailable";
    loadMoreButton.hidden = true;
    return;
  }

  const matchingJobs = getMatchingJobs();
  const hadCards = jobsContainer.querySelectorAll(".job-card").length > 0;
  const oldCardCount = resetLimit ? 0 : jobsContainer.querySelectorAll(".job-card").length;
  const numberToShow = Math.min(visibleJobLimit, matchingJobs.length);

  resultsCount.textContent = "Showing " + numberToShow + " of " + matchingJobs.length + " jobs";
  loadMoreButton.hidden = numberToShow >= matchingJobs.length;

  if (matchingJobs.length === 0) {
    jobsContainer.innerHTML = buildEmptyState("No opportunities found", "Try another search or remove a filter to see more roles.", true);
    return;
  }

  let markup = "";
  for (let i = 0; i < numberToShow; i++) {
    markup += buildJobCard(matchingJobs[i], false);
  }
  jobsContainer.innerHTML = markup;


  const cards = jobsContainer.querySelectorAll(".job-card");
  const firstNewCard = !hadCards ? 0 : (resetLimit ? cards.length : oldCardCount);
  for (let i = firstNewCard; i < cards.length; i++) {
    cards[i].classList.add("is-revealed");
    cards[i].style.animationDelay = (i - firstNewCard) * 55 + "ms";
  }
  window.scrollTo({ top: savedY, left: 0, behavior: "instant" });


  if (focusNewCard && cards[oldCardCount]) {
    cards[oldCardCount].setAttribute("tabindex", "-1");
    cards[oldCardCount].focus({ preventScroll: true });
  }
}


function renderSavedJobs() {
  if (!currentUser) {
    savedJobsContainer.innerHTML = buildEmptyState("Login to see your saved jobs", "Sign in to view the opportunities you have saved.", false);
    updateCountBadges();
    return;
  }

  let markup = "";
  for (let i = 0; i < savedJobIds.length; i++) {
    const job = getJobById(savedJobIds[i]);
    if (job) markup += buildJobCard(job, true);
  }
  if (markup === "") {
    markup = buildEmptyState("No saved jobs yet", "Save an opportunity and it will be ready for you here.", false);
  }
  savedJobsContainer.innerHTML = markup;
  updateCountBadges();
}


function renderApplications() {
  if (!currentUser) {
    applicationSummary.hidden = true;
    applicationsContainer.innerHTML = buildEmptyState("Login to see your applications", "Sign in to view and track your applications.", false);
    updateCountBadges();
    return;
  }

  applicationSummary.hidden = applications.length === 0;
  const copy = applications.length === 1 ? "Application in progress" : "Applications in progress";
  applicationSummary.innerHTML = `<span class="application-summary-count">${applications.length}</span><span class="application-summary-copy"><strong>${copy}</strong><span>Saved in this browser</span></span>`;

  let markup = "";
  for (let i = 0; i < applications.length; i++) {
    markup += buildApplicationCard(applications[i]);
  }
  if (markup === "") {
    markup = buildEmptyState("No applications yet", "Your submitted applications and their progress will appear here.", false);
  }
  applicationsContainer.innerHTML = markup;
  updateCountBadges();
}


function redrawEverything() {
  updateNavbar();
  renderJobs(true, false);
  renderSavedJobs();
  renderApplications();
}


function syncSavedButtons(jobId) {
  const buttons = document.querySelectorAll('[data-action="toggle-saved"]');
  const saved = isJobSaved(jobId);
  const job = getJobById(jobId);
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    if (button.dataset.jobId !== jobId) continue;
    button.classList.toggle("is-saved", saved);
    button.setAttribute("aria-pressed", String(saved));
    if (button.classList.contains("save-icon-button")) {
      if (job) button.setAttribute("aria-label", (saved ? "Remove from saved: " : "Save job: ") + job.title);
    } else {
      button.textContent = saved ? "Saved" : "Save Job";
    }
  }
}


function updateAppliedButtons(jobId) {
  const buttons = document.querySelectorAll('[data-action="apply"]');
  const applied = hasApplied(jobId);
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    if (button.dataset.jobId !== jobId) continue;
    button.disabled = applied;
    if (applied) button.textContent = "Applied ✓";
    else if (button.closest(".saved-job-card")) button.textContent = "Apply";
    else button.textContent = "Apply Now";
  }
}

function showJobDetails(job, triggerButton) {
  detailsJob = job;
  jobDetails.innerHTML = buildJobDetails(job);
  openModal(jobModal, triggerButton, closeModalButton);
}

function showApplicationForm(job, triggerButton) {
  if (!currentUser) {
    requireLogin("apply", job, triggerButton);
    return;
  }
  if (hasApplied(job.id)) {
    showToast("You have already applied for this job.");
    return;
  }
  selectedJob = job;
  applicationJobTitle.textContent = job.title;
  applicationForm.reset();
  clearResumeField();
  clearAllFieldErrors();
  clearFormMessage();
  applicantName.value = currentUser.name;
  applicantEmail.value = currentUser.email;
  updateCharacterCounter();
  openModal(applicationModal, triggerButton, applicantName);
}

function highlightNavLink() {
  const sections = document.querySelectorAll("[data-spy-section]");
  const marker = window.scrollY + 150;
  let activeSection = "";
  for (let i = 0; i < sections.length; i++) {

    if (sections[i].offsetHeight === 0) continue;
    if (sections[i].offsetTop <= marker) activeSection = sections[i].id;
  }
  const links = navLinks.querySelectorAll("a[href^='#']");
  for (let i = 0; i < links.length; i++) {
    const isActive = links[i].getAttribute("href") === "#" + activeSection;
    links[i].classList.toggle("is-active", isActive);
  }
}

function revealSections() {
  const items = document.querySelectorAll("[data-reveal]");
  for (let i = 0; i < items.length; i++) {
    if (items[i].getBoundingClientRect().top < window.innerHeight - 40) {
      items[i].classList.add("is-visible");
    }
  }
}


function startStatsWhenVisible() {
  const stats = document.getElementById("stats");
  if (statsAnimated || !stats) return;
  if (stats.getBoundingClientRect().top < window.innerHeight - 40) animateStats();
}


function onScroll() {
  highlightNavLink();
  revealSections();
  startStatsWhenVisible();
  backToTop.classList.toggle("is-visible", window.scrollY > 600);
}


function animateStats() {
  statsAnimated = true;
  const counters = document.querySelectorAll("[data-count]");
  const motionOff = prefersReducedMotion.matches || document.documentElement.classList.contains("motion-paused");
  for (let i = 0; i < counters.length; i++) {
    const target = Number(counters[i].dataset.count);
    const suffix = counters[i].dataset.suffix || "";
    if (motionOff) counters[i].textContent = target + suffix;
    else animateCounter(counters[i], target, suffix);
  }
}


function animateCounter(counter, target, suffix) {
  let currentValue = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const timer = window.setInterval(function () {
    currentValue += step;
    if (currentValue >= target) {
      currentValue = target;
      window.clearInterval(timer);
    }
    counter.textContent = currentValue + suffix;
  }, 25);
  statTimers.push(timer);
}


function finishStats() {
  for (let i = 0; i < statTimers.length; i++) window.clearInterval(statTimers[i]);
  statTimers = [];
  const counters = document.querySelectorAll("[data-count]");
  for (let i = 0; i < counters.length; i++) {
    counters[i].textContent = counters[i].dataset.count + (counters[i].dataset.suffix || "");
  }
}


function openModal(modal, triggerButton, firstFocusElement) {
  modal.triggerButton = triggerButton;
  modal.hidden = false;
  document.body.classList.add("modal-open"); // stops the page behind from scrolling
  firstFocusElement.focus();
}

function closeModal(modal) {
  if (modal.hidden) return;
  modal.hidden = true;
  // Allow scrolling again once no popup is open.
  if (!document.querySelector(".job-modal:not([hidden])")) document.body.classList.remove("modal-open");
  const trigger = modal.triggerButton;
  modal.triggerButton = null;
  if (trigger && document.contains(trigger)) trigger.focus();
}

function closeAuthModal() {
  pendingAction = null;
  closeModal(authModal);
}


function setAuthMode(mode) {
  const registerMode = mode === "register";
  loginForm.hidden = registerMode;
  registerForm.hidden = !registerMode;
  loginTab.classList.toggle("is-active", !registerMode);
  registerTab.classList.toggle("is-active", registerMode);
}

function openAuthModal(mode, triggerButton) {
  resetAuthForms();
  setAuthMode(mode);
  const firstField = document.getElementById(mode === "register" ? "register-name" : "login-email");
  openModal(authModal, triggerButton, firstField);
}


function requireLogin(action, job, triggerButton) {
  pendingAction = { action: action, job: job };
  showToast("Please login to continue");
  openAuthModal("login", triggerButton);
}


function clearFormMessage() {
  formMessage.textContent = "";
  formMessage.className = "form-message";
}


function setFieldError(field, errorId, message) {
  document.getElementById(errorId).textContent = message;
  field.setAttribute("aria-invalid", "true");
}

function clearFieldError(field, errorId) {
  document.getElementById(errorId).textContent = "";
  field.removeAttribute("aria-invalid");
}


function clearAllFieldErrors() {
  clearFieldError(applicantName, "applicant-name-error");
  clearFieldError(applicantEmail, "applicant-email-error");
  clearFieldError(coverMessage, "cover-message-error");
  clearFieldError(resumeFile, "resume-error");
}


function updateCharacterCounter() {
  coverCounter.textContent = coverMessage.value.trim().length + " / 30 characters";
}


function validateResume(file) {
  if (!file) return "Please upload your resume.";
  const fileName = file.name.toLowerCase();
  const goodType = fileName.endsWith(".pdf") || fileName.endsWith(".doc") || fileName.endsWith(".docx");
  if (!goodType) return "Only PDF, DOC or DOCX files are allowed.";
  if (file.size > 2 * 1024 * 1024) return "File is too large. Maximum size is 2 MB.";
  return "";
}


function updateResumeInfo() {
  const file = resumeFile.files[0];
  clearFieldError(resumeFile, "resume-error");
  if (!file) {
    resumeInfo.textContent = "";
    return;
  }
  resumeInfo.textContent = "Selected: " + file.name + " (" + formatFileSize(file.size) + ")";
}


function clearResumeField() {
  resumeFile.value = "";
  resumeInfo.textContent = "";
  clearFieldError(resumeFile, "resume-error");
}

function saveApplications(updatedApplications, failureMessage) {
  if (!currentUser || !writeStorage(applicationsKey(), updatedApplications)) {
    showToast(failureMessage);
    return false;
  }
  applications = updatedApplications;
  updateCountBadges();
  return true;
}

function showFormError(message) {
  formMessage.textContent = message;
  formMessage.className = "form-message error-message";
}

function submitApplication(event) {
  event.preventDefault();
  clearAllFieldErrors();
  clearFormMessage();

  const name = applicantName.value.trim();
  const email = applicantEmail.value.trim();
  const message = coverMessage.value.trim();

  if (!name) {
    setFieldError(applicantName, "applicant-name-error", "Please enter your full name.");
    applicantName.focus();
    return;
  }
  if (!isValidEmail(email)) {
    setFieldError(applicantEmail, "applicant-email-error", "Please enter a valid email address.");
    applicantEmail.focus();
    return;
  }
  if (message.length < 30) {
    setFieldError(coverMessage, "cover-message-error", "Please write at least 30 characters.");
    coverMessage.focus();
    return;
  }

  const resume = resumeFile.files[0];
  const resumeError = validateResume(resume);
  if (resumeError) {
    setFieldError(resumeFile, "resume-error", resumeError);
    resumeFile.focus();
    return;
  }

  if (!currentUser) {
    showFormError("Please login to continue.");
    return;
  }
  if (!selectedJob) {
    showFormError("Select a job before submitting your application.");
    return;
  }
  if (hasApplied(selectedJob.id)) {
    showFormError("You have already applied for this job.");
    return;
  }


  const application = {
    applicationId: createApplicationId(),
    jobId: selectedJob.id,
    jobTitle: selectedJob.title,
    company: selectedJob.company,
    name: name,
    email: email,
    message: message,
    resumeName: resume.name,
    resumeSize: resume.size,
    appliedDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    status: "Submitted"
  };
  const updatedApplications = applications.slice();
  updatedApplications.push(application);
  if (!saveApplications(updatedApplications, "Your application could not be saved. Please try again.")) {
    showFormError("Your application could not be saved. Please try again.");
    return;
  }

  renderApplications();
  updateAppliedButtons(selectedJob.id);
  formMessage.textContent = "Your application for " + selectedJob.title + " was submitted successfully.";
  formMessage.className = "form-message success-message";
  showToast("Application submitted");
  applicationForm.reset();
  clearResumeField();
  updateCharacterCounter();
  clearAllFieldErrors();
}

function clearAuthErrors() {
  const errorIds = ["login-email-error", "login-password-error", "register-name-error", "register-email-error", "register-password-error", "register-confirm-password-error"];
  for (let i = 0; i < errorIds.length; i++) {
    document.getElementById(errorIds[i]).textContent = "";
  }
  const fields = authModal.querySelectorAll("input");
  for (let i = 0; i < fields.length; i++) {
    fields[i].removeAttribute("aria-invalid");
  }
  loginMessage.textContent = "";
  registerMessage.textContent = "";
}


function resetAuthForms() {
  loginForm.reset();
  registerForm.reset();
  const passwordIds = ["login-password", "register-password", "register-confirm-password"];
  for (let i = 0; i < passwordIds.length; i++) {
    document.getElementById(passwordIds[i]).type = "password";
  }
  clearAuthErrors();
}

function setAuthError(fieldId, errorId, message) {
  document.getElementById(errorId).textContent = message;
  document.getElementById(fieldId).setAttribute("aria-invalid", "true");
}


function isEmailRegistered(email) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === email) return true;
  }
  return false;
}

function finishLogin(user, welcomeMessage) {
  currentUser = user;
  if (!writeText("careerHubCurrentUser", user.email)) {
    showToast("Your login could not be remembered in this browser.");
  }
  loadSavedJobs();
  loadApplications();
  redrawEverything();

  if (!jobModal.hidden && detailsJob) jobDetails.innerHTML = buildJobDetails(detailsJob);

  const action = pendingAction;
  pendingAction = null;
  let actionButton = null;
  if (action) {
    const buttonName = action.action === "save" ? "toggle-saved" : "apply";
    actionButton = findJobButton(buttonName, action.job.id);
    authModal.triggerButton = actionButton;
  }
  closeModal(authModal);
  showToast(welcomeMessage);

  if (!action) document.getElementById("jobs").scrollIntoView();
  if (action && action.action === "save" && !isJobSaved(action.job.id)) toggleSavedJob(action.job);
  if (action && action.action === "apply") showApplicationForm(action.job, actionButton);
}

function findJobButton(action, jobId) {
  const buttons = document.querySelectorAll("[data-action][data-job-id]");
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].dataset.action === action && buttons[i].dataset.jobId === jobId) return buttons[i];
  }
  return null;
}

function registerUser(event) {
  event.preventDefault();
  clearAuthErrors();

  const nameField = document.getElementById("register-name");
  const emailField = document.getElementById("register-email");
  const passwordField = document.getElementById("register-password");
  const confirmField = document.getElementById("register-confirm-password");
  const name = nameField.value.trim();
  const email = emailField.value.trim().toLowerCase();
  const password = passwordField.value;

  if (!name) {
    setAuthError("register-name", "register-name-error", "Please enter your full name.");
    nameField.focus();
    return;
  }
  if (!isValidEmail(email)) {
    setAuthError("register-email", "register-email-error", "Please enter a valid email address.");
    emailField.focus();
    return;
  }
  if (password.length < 6) {
    setAuthError("register-password", "register-password-error", "Password must be at least 6 characters.");
    passwordField.focus();
    return;
  }
  if (password !== confirmField.value) {
    setAuthError("register-confirm-password", "register-confirm-password-error", "Passwords do not match.");
    confirmField.focus();
    return;
  }
  if (isEmailRegistered(email)) {
    setAuthError("register-email", "register-email-error", "This email is already registered");
    emailField.focus();
    return;
  }

  const user = { name: name, email: email, password: password };
  users.push(user);
  if (!writeStorage("careerHubUsers", users)) {
    users.pop();
    registerMessage.textContent = "Could not create the account. Please try again.";
    return;
  }
  finishLogin(user, "Welcome, " + name + "!");
}

function loginUser(event) {
  event.preventDefault();
  clearAuthErrors();

  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value;
  let foundUser = null;
  for (let i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === email && users[i].password === password) foundUser = users[i];
  }

  if (!foundUser) {
    loginMessage.textContent = "Incorrect email or password.";
    loginMessage.className = "form-message error-message";
    return;
  }
  finishLogin(foundUser, "Welcome back, " + foundUser.name + "!");
}

function logoutUser() {
  try {
    localStorage.removeItem("careerHubCurrentUser");
  } catch (error) {
    console.warn("Could not clear the login.", error);
  }
  currentUser = null;
  savedJobIds = [];
  applications = [];
  redrawEverything();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  showToast("You have logged out");
}

function togglePasswordVisibility(event) {
  const checkbox = event.target;
  if (!checkbox.matches("[data-show-password]")) return;
  const inputIds = checkbox.dataset.showPassword.split(",");
  for (let i = 0; i < inputIds.length; i++) {
    document.getElementById(inputIds[i]).type = checkbox.checked ? "text" : "password";
  }
}

function onAuthInput(event) {
  const field = event.target;
  if (!field.id) return;
  const error = document.getElementById(field.id + "-error");
  if (error) error.textContent = "";
  field.removeAttribute("aria-invalid");
}

function onJobAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button || !event.currentTarget.contains(button)) return;
  const action = button.dataset.action;

  if (action === "clear-filters") {
    clearFilters();
    return;
  }
  if (action === "search-skill") {
    searchInput.value = button.dataset.skill || "";
    renderJobs(true, false);
    // Skill chips in Saved Jobs sit far from the search box, so bring the results into view.
    if (event.currentTarget === savedJobsContainer) document.getElementById("jobs").scrollIntoView();
    searchInput.focus({ preventScroll: true });
    return;
  }

  const job = getJobById(button.dataset.jobId);
  if (!job) return;

  if (!currentUser && (action === "apply" || action === "toggle-saved")) {
    requireLogin(action === "apply" ? "apply" : "save", job, button);
    return;
  }

  if (action === "apply") showApplicationForm(job, button);
  else if (action === "details") showJobDetails(job, button);
  else if (action === "toggle-saved") toggleSavedJob(job);
  else if (action === "remove-saved") removeSavedJob(job.id);
}

function toggleSavedJob(job) {
  if (!currentUser) {
    requireLogin("save", job, null);
    return;
  }
  const updatedIds = [];
  let wasSaved = false;
  for (let i = 0; i < savedJobIds.length; i++) {
    if (savedJobIds[i] === job.id) wasSaved = true;
    else updatedIds.push(savedJobIds[i]);
  }
  if (!wasSaved) updatedIds.push(job.id);

  if (!writeStorage(savedJobsKey(), updatedIds)) {
    showToast("Could not update saved jobs. Please try again.");
    return;
  }
  savedJobIds = updatedIds;
  renderSavedJobs();
  syncSavedButtons(job.id);
  showToast(wasSaved ? "Job removed" : "Job saved");
}

function removeSavedJob(jobId) {
  const updatedIds = [];
  for (let i = 0; i < savedJobIds.length; i++) {
    if (savedJobIds[i] !== jobId) updatedIds.push(savedJobIds[i]);
  }
  if (!writeStorage(savedJobsKey(), updatedIds)) {
    showToast("Could not remove the saved job. Please try again.");
    return;
  }
  savedJobIds = updatedIds;
  renderSavedJobs();
  syncSavedButtons(jobId);
  showToast("Job removed");
}

function withdrawApplication(application) {
  if (!window.confirm("Withdraw your application for " + application.jobTitle + "?")) return;
  const updatedApplications = [];
  for (let i = 0; i < applications.length; i++) {
    if (applications[i].applicationId !== application.applicationId) updatedApplications.push(applications[i]);
  }
  if (saveApplications(updatedApplications, "Could not withdraw this application. Please try again.")) {
    renderApplications();
    updateAppliedButtons(application.jobId);
    showToast("Application withdrawn");
  }
}

function onApplicationAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button || !event.currentTarget.contains(button)) return;
  const application = getApplicationById(button.dataset.applicationId);
  if (!application) return;

  if (button.dataset.action === "remove-application") withdrawApplication(application);
}

function onCategoryTabClick(event) {
  const tab = event.target.closest("[data-category]");
  if (!tab) return;
  selectedCategory = tab.dataset.category;
  updateCategoryTabs(false);
  renderJobs(true, false);
}

function onSearchChange() {
  renderJobs(true, false);
}

function onSearchKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    renderJobs(true, false);
  }
}

function showMoreJobs() {
  visibleJobLimit += 6;
  renderJobs(false, true);
}

function onNameInput() {
  clearFieldError(applicantName, "applicant-name-error");
}

function onEmailInput() {
  clearFieldError(applicantEmail, "applicant-email-error");
}

function onCoverMessageInput() {
  updateCharacterCounter();
  clearFieldError(coverMessage, "cover-message-error");
}

function onCloseJobModal() {
  closeModal(jobModal);
}

function onCloseApplication() {
  closeModal(applicationModal);
}


function onModalBackdropClick(event) {
  if (event.target === jobModal) closeModal(jobModal);
  if (event.target === applicationModal) closeModal(applicationModal);
  if (event.target === authModal) closeAuthModal();
}

function onDocumentKeydown(event) {
  if (event.key === "Escape") {
    if (!applicationModal.hidden) closeModal(applicationModal);
    else if (!authModal.hidden) closeAuthModal();
    else if (!jobModal.hidden) closeModal(jobModal);
  }
}

function onJobsLinkClick(event) {
  const link = event.target.closest("a[href='#jobs'], a[href='#saved-jobs'], a[href='#applications']");
  if (!link || currentUser) return;
  event.preventDefault();
  openAuthModal("register", link);
}

function onAuthButtonClick(event) {
  const button = event.target.closest("[data-auth-open]");
  if (!button) return;
  openAuthModal(button.dataset.authOpen, button);
}

function onLoginTabClick() {
  resetAuthForms();
  setAuthMode("login");
  document.getElementById("login-email").focus();
}

// Switch to the Register tab (keeps the same button to return focus to).
function onRegisterTabClick() {
  resetAuthForms();
  setAuthMode("register");
  document.getElementById("register-name").focus();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}


function toggleTheme() {
  const darkMode = document.documentElement.dataset.theme !== "dark";
  const theme = darkMode ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", darkMode ? "Switch to light mode" : "Switch to dark mode");
  if (!writeText("careerHubTheme", theme)) showToast("Theme preference could not be saved.");
}

function initializeTheme() {
  const storedTheme = readStorage("careerHubTheme");
  let darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (storedTheme === "dark") darkMode = true;
  if (storedTheme === "light") darkMode = false;
  document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  themeToggle.setAttribute("aria-label", darkMode ? "Switch to light mode" : "Switch to dark mode");
}

function toggleMotion() {
  const paused = motionToggle.getAttribute("aria-pressed") !== "true";
  document.documentElement.classList.toggle("motion-paused", paused);
  motionToggle.setAttribute("aria-pressed", String(paused));
  motionToggle.title = paused ? "Resume animations" : "Pause animations";
  if (!writeText("careerHubMotionPaused", String(paused))) showToast("Motion preference could not be saved.");
  if (paused) {
    finishStats();
    const items = document.querySelectorAll("[data-reveal]");
    for (let i = 0; i < items.length; i++) items[i].classList.add("is-visible");
  }
}


function initializeMotion() {
  const storedMotion = readStorage("careerHubMotionPaused");
  const paused = storedMotion === "true" || (storedMotion === null && prefersReducedMotion.matches);
  document.documentElement.classList.toggle("motion-paused", paused);
  motionToggle.setAttribute("aria-pressed", String(paused));
  motionToggle.title = paused ? "Resume animations" : "Pause animations";
}

function loadSavedData() {
  loadUsers();
  loadCurrentUser();
  loadSavedJobs();
  loadApplications();
}

function connectJobEvents() {
  jobsContainer.addEventListener("click", onJobAction);
  savedJobsContainer.addEventListener("click", onJobAction);
  jobDetails.addEventListener("click", onJobAction);
  applicationsContainer.addEventListener("click", onApplicationAction);
  searchInput.addEventListener("input", onSearchChange);
  searchInput.addEventListener("keydown", onSearchKeydown);
  searchButton.addEventListener("click", onSearchChange);
  typeFilter.addEventListener("change", onSearchChange);
  locationFilter.addEventListener("change", onSearchChange);
  sortFilter.addEventListener("change", onSearchChange);
  clearFiltersButton.addEventListener("click", clearFilters);
  categoryTabs.addEventListener("click", onCategoryTabClick);
  loadMoreButton.addEventListener("click", showMoreJobs);
}

function connectApplicationEvents() {
  applicationForm.addEventListener("submit", submitApplication);
  applicantName.addEventListener("input", onNameInput);
  applicantEmail.addEventListener("input", onEmailInput);
  coverMessage.addEventListener("input", onCoverMessageInput);
  resumeFile.addEventListener("change", updateResumeInfo);
  closeModalButton.addEventListener("click", onCloseJobModal);
  closeApplicationButton.addEventListener("click", onCloseApplication);
  jobModal.addEventListener("click", onModalBackdropClick);
  applicationModal.addEventListener("click", onModalBackdropClick);
}

function connectAuthEvents() {
  loginButton.addEventListener("click", onAuthButtonClick);
  registerButton.addEventListener("click", onAuthButtonClick);
  logoutButton.addEventListener("click", logoutUser);
  loginGate.addEventListener("click", onAuthButtonClick);
  document.addEventListener("click", onJobsLinkClick);
  loginForm.addEventListener("submit", loginUser);
  registerForm.addEventListener("submit", registerUser);
  loginTab.addEventListener("click", onLoginTabClick);
  registerTab.addEventListener("click", onRegisterTabClick);
  closeAuthButton.addEventListener("click", closeAuthModal);
  authModal.addEventListener("click", onModalBackdropClick);
  authModal.addEventListener("input", onAuthInput);
  authModal.addEventListener("change", togglePasswordVisibility);
}

function connectPageEvents() {
  themeToggle.addEventListener("click", toggleTheme);
  motionToggle.addEventListener("click", toggleMotion);
  backToTop.addEventListener("click", scrollToTop);
  document.addEventListener("keydown", onDocumentKeydown);
  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onScroll);
}

function initializePage() {
  loadSavedData();
  initializeTheme();
  initializeMotion();

  connectJobEvents();
  connectApplicationEvents();
  connectAuthEvents();
  connectPageEvents();

  updateCharacterCounter();
  updateNavbar();
  renderSavedJobs();
  renderApplications();
  renderJobs(false, false);
  onScroll();
  if (storageWarning) showToast("Some saved browser data could not be read.");
}

initializePage();