// Sample job and internship opportunities
const jobs = [
  {
    id: "frontend-developer-intern",
    title: "Frontend Developer Intern",
    company: "Bright Pixel Studio",
    location: "Remote",
    type: "Internship",
    skills: "HTML, CSS, JavaScript",
    description: "Help build and improve accessible website experiences with a supportive product team.",
    salary: "$20–$25 per hour",
    postedDate: "October 2, 2026"
  },
  {
    id: "junior-web-developer",
    title: "Junior Web Developer",
    company: "Northstar Digital",
    location: "New York, NY",
    type: "Full-time",
    skills: "HTML, CSS, JavaScript",
    description: "Create and maintain responsive websites while learning from experienced developers.",
    salary: "$58,000–$72,000 per year",
    postedDate: "October 4, 2026"
  },
  {
    id: "ux-design-intern",
    title: "UX Design Intern",
    company: "Craft & Co.",
    location: "Chicago, IL",
    type: "Internship",
    skills: "Figma, Wireframing, Prototyping",
    description: "Support user research and help turn ideas into clear, friendly product designs.",
    salary: "$19–$23 per hour",
    postedDate: "October 5, 2026"
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    company: "Clearview Analytics",
    location: "Austin, TX",
    type: "Full-time",
    skills: "Excel, SQL, Data Visualization",
    description: "Prepare reports and explain useful trends to teams across the organization.",
    salary: "$62,000–$78,000 per year",
    postedDate: "October 6, 2026"
  },
  {
    id: "marketing-intern",
    title: "Marketing Intern",
    company: "Goodway Media",
    location: "Remote",
    type: "Internship",
    skills: "Content Writing, Social Media, Research",
    description: "Help plan social content, research audiences, and support campaign delivery.",
    salary: "$18–$22 per hour",
    postedDate: "October 7, 2026"
  },
  {
    id: "product-support-associate",
    title: "Product Support Associate",
    company: "Launchpad Software",
    location: "Boston, MA",
    type: "Part-time",
    skills: "Communication, Problem Solving, Customer Support",
    description: "Answer product questions and help customers find straightforward solutions.",
    salary: "$22–$27 per hour",
    postedDate: "October 8, 2026"
  }
];

// Page elements
const jobsContainer = document.getElementById("jobs-container");
const savedJobsContainer = document.getElementById("saved-jobs-container");
const applicationsContainer = document.getElementById("applications-container");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const typeFilter = document.getElementById("type-filter");
const locationFilter = document.getElementById("location-filter");
const sortFilter = document.getElementById("sort-filter");
const clearFiltersButton = document.getElementById("clear-filters");
const resultsCount = document.getElementById("results-count");
const jobModal = document.getElementById("job-modal");
const jobDetails = document.getElementById("job-details");
const closeModalButton = document.getElementById("close-modal");
const applicationModal = document.getElementById("application-modal");
const applicationForm = document.getElementById("application-form");
const applicationJobTitle = document.getElementById("application-job-title");
const applicantName = document.getElementById("applicant-name");
const applicantEmail = document.getElementById("applicant-email");
const coverMessage = document.getElementById("cover-message");
const formMessage = document.getElementById("form-message");
const closeApplicationButton = document.getElementById("close-application");
const toast = document.getElementById("toast");

// Saved state and modal state
let savedJobIds = [];
let applications = [];
let selectedJob = null;
let toastTimer;
let nextApplicationNumber = Date.now();

// Read saved arrays safely if browser storage is available
function loadFromStorage(key) {
  try {
    const savedValue = localStorage.getItem(key);

    if (savedValue === null) {
      return [];
    }

    const parsedValue = JSON.parse(savedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

// Save an array and report whether saving succeeded
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

// Convert text to safe HTML before inserting it into a template
function escapeHTML(value) {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  };

  return String(value).replace(/[&<>"']/g, function (character) {
    return entities[character];
  });
}

// Load data in the current storage format
const savedJobsFromStorage = loadFromStorage("careerHubSavedJobs");

for (let i = 0; i < savedJobsFromStorage.length; i++) {
  if (typeof savedJobsFromStorage[i] === "string") {
    savedJobIds.push(savedJobsFromStorage[i]);
  }
}

const applicationsFromStorage = loadFromStorage("careerHubApplications");

for (let i = 0; i < applicationsFromStorage.length; i++) {
  const application = applicationsFromStorage[i];

  if (
    application &&
    typeof application.applicationId === "string" &&
    typeof application.jobId === "string" &&
    typeof application.jobTitle === "string" &&
    typeof application.company === "string" &&
    typeof application.name === "string" &&
    typeof application.email === "string" &&
    typeof application.message === "string" &&
    typeof application.appliedDate === "string"
  ) {
    applications.push(application);
  }
}

// Check whether a job ID is in the saved list
function isJobSaved(jobId) {
  for (let i = 0; i < savedJobIds.length; i++) {
    if (savedJobIds[i] === jobId) {
      return true;
    }
  }

  return false;
}

// Find a job using its unique ID
function getJobById(jobId) {
  for (let i = 0; i < jobs.length; i++) {
    if (jobs[i].id === jobId) {
      return jobs[i];
    }
  }

  return null;
}

// Return jobs that match search and filter choices
function getMatchingJobs() {
  const searchText = searchInput.value.trim().toLowerCase();
  const selectedType = typeFilter.value;
  const selectedLocation = locationFilter.value;
  const matchingJobs = [];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const matchesSearch = searchText === "" ||
      job.title.toLowerCase().includes(searchText) ||
      job.company.toLowerCase().includes(searchText) ||
      job.skills.toLowerCase().includes(searchText);
    const matchesType = selectedType === "All Types" || job.type === selectedType;
    const matchesLocation = selectedLocation === "All Locations" ||
      job.location === selectedLocation;

    if (matchesSearch && matchesType && matchesLocation) {
      matchingJobs.push(job);
    }
  }

  if (sortFilter.value === "title") {
    sortJobs(matchingJobs, "title");
  } else if (sortFilter.value === "company") {
    sortJobs(matchingJobs, "company");
  }

  return matchingJobs;
}

// Sort matching jobs alphabetically by title or company
function sortJobs(jobsToSort, sortBy) {
  for (let i = 0; i < jobsToSort.length - 1; i++) {
    for (let j = 0; j < jobsToSort.length - 1 - i; j++) {
      let firstValue = "";
      let secondValue = "";

      if (sortBy === "title") {
        firstValue = jobsToSort[j].title.toLowerCase();
        secondValue = jobsToSort[j + 1].title.toLowerCase();
      } else {
        firstValue = jobsToSort[j].company.toLowerCase();
        secondValue = jobsToSort[j + 1].company.toLowerCase();
      }

      if (firstValue > secondValue) {
        const temporaryJob = jobsToSort[j];
        jobsToSort[j] = jobsToSort[j + 1];
        jobsToSort[j + 1] = temporaryJob;
      }
    }
  }
}

// Build the three job-related lists from the current data
function render() {
  const matchingJobs = getMatchingJobs();
  resultsCount.textContent = matchingJobs.length + (matchingJobs.length === 1 ? " job found" : " jobs found");

  if (matchingJobs.length === 0) {
    jobsContainer.innerHTML = "<p class=\"no-jobs\">No jobs match your search or filters.</p>";
  } else {
    let jobCards = "";

    for (let i = 0; i < matchingJobs.length; i++) {
      const job = matchingJobs[i];
      const saved = isJobSaved(job.id);
      jobCards += `
        <article class="job-card">
          <span class="job-type">${escapeHTML(job.type)}</span>
          <h3>${escapeHTML(job.title)}</h3>
          <p class="job-company">${escapeHTML(job.company)}</p>
          <p class="job-location">${escapeHTML(job.location)}</p>
          <p class="job-skills"><strong>Skills:</strong> ${escapeHTML(job.skills)}</p>
          <div class="card-buttons">
            <button type="button" class="details-button" data-action="details" data-job-id="${escapeHTML(job.id)}">View Details</button>
            <button type="button" class="apply-button" data-action="apply" data-job-id="${escapeHTML(job.id)}">Apply Now</button>
            <button type="button" class="save-button${saved ? " is-saved" : ""}" data-action="toggle-saved" data-job-id="${escapeHTML(job.id)}" aria-pressed="${saved}">
              ${saved ? "Saved" : "Save Job"}
            </button>
          </div>
        </article>
      `;
    }

    jobsContainer.innerHTML = jobCards;

    const detailsButtons = jobsContainer.getElementsByClassName("details-button");
    for (let i = 0; i < detailsButtons.length; i++) {
      detailsButtons[i].addEventListener("click", function () {
        const jobId = detailsButtons[i].getAttribute("data-job-id");
        const job = getJobById(jobId);

        if (job !== null) {
          showJobDetails(job);
        }
      });
    }

    const applyButtons = jobsContainer.getElementsByClassName("apply-button");
    for (let i = 0; i < applyButtons.length; i++) {
      applyButtons[i].addEventListener("click", function () {
        const jobId = applyButtons[i].getAttribute("data-job-id");
        const job = getJobById(jobId);

        if (job !== null) {
          showApplicationForm(job);
        }
      });
    }

    const saveButtons = jobsContainer.getElementsByClassName("save-button");
    for (let i = 0; i < saveButtons.length; i++) {
      saveButtons[i].addEventListener("click", function () {
        const jobId = saveButtons[i].getAttribute("data-job-id");
        const job = getJobById(jobId);

        if (job !== null) {
          toggleSavedJob(job);
        }
      });
    }
  }

  renderSavedJobs();
  renderApplications();
}

// Show saved jobs and their remove buttons
function renderSavedJobs() {
  if (savedJobIds.length === 0) {
    savedJobsContainer.innerHTML = "<p class=\"no-jobs\">No saved jobs yet.</p>";
    return;
  }

  let savedJobCards = "";

  for (let i = 0; i < savedJobIds.length; i++) {
    const job = getJobById(savedJobIds[i]);

    if (job !== null) {
      savedJobCards += `
      <article class="saved-job-card">
        <span class="job-type">${escapeHTML(job.type)}</span>
        <h3>${escapeHTML(job.title)}</h3>
        <p class="job-company">${escapeHTML(job.company)}</p>
        <p class="job-location">${escapeHTML(job.location)}</p>
        <button type="button" class="remove-saved-button" data-action="remove-saved" data-job-id="${escapeHTML(job.id)}">Remove</button>
      </article>
    `;
    }
  }

  savedJobsContainer.innerHTML = savedJobCards;

  const removeButtons = savedJobsContainer.getElementsByClassName("remove-saved-button");
  for (let i = 0; i < removeButtons.length; i++) {
    removeButtons[i].addEventListener("click", function () {
      const jobId = removeButtons[i].getAttribute("data-job-id");
      removeSavedJob(jobId);
    });
  }
}

// Show submitted applications
function renderApplications() {
  if (applications.length === 0) {
    applicationsContainer.innerHTML = "<p class=\"no-jobs\">You haven't applied for any jobs yet.</p>";
    return;
  }

  let applicationCards = "";

  for (let i = 0; i < applications.length; i++) {
    const application = applications[i];
    applicationCards += `
      <article class="application-card">
        <div class="application-card-heading">
          <h3>${escapeHTML(application.jobTitle)}</h3>
          <span class="status-badge">Submitted</span>
        </div>
        <p><strong>Company:</strong> ${escapeHTML(application.company)}</p>
        <p><strong>Applicant:</strong> ${escapeHTML(application.name)}</p>
        <p><strong>Email:</strong> ${escapeHTML(application.email)}</p>
        <p><strong>Cover Message:</strong> ${escapeHTML(application.message)}</p>
        <p><strong>Date applied:</strong> ${escapeHTML(application.appliedDate)}</p>
        <button type="button" class="remove-application-button" data-action="remove-application" data-application-id="${escapeHTML(application.applicationId)}">Remove</button>
      </article>
    `;
  }

  applicationsContainer.innerHTML = applicationCards;

  const removeButtons = applicationsContainer.getElementsByClassName("remove-application-button");
  for (let i = 0; i < removeButtons.length; i++) {
    removeButtons[i].addEventListener("click", function () {
      const applicationId = removeButtons[i].getAttribute("data-application-id");
      removeApplication(applicationId);
    });
  }
}

// Save or remove a job by its unique ID
function toggleSavedJob(job) {
  let savedJobIndex = -1;
  const updatedSavedJobIds = [];

  for (let i = 0; i < savedJobIds.length; i++) {
    if (savedJobIds[i] === job.id) {
      savedJobIndex = i;
    } else {
      updatedSavedJobIds.push(savedJobIds[i]);
    }
  }

  let message = "Job saved";

  if (savedJobIndex === -1) {
    updatedSavedJobIds.push(job.id);
  } else {
    message = "Job removed";
  }

  if (!saveToStorage("careerHubSavedJobs", updatedSavedJobIds)) {
    showToast("Could not update saved jobs. Please try again.");
    return;
  }

  savedJobIds = updatedSavedJobIds;
  render();
  showToast(message);
}

// Remove a saved job from the saved list
function removeSavedJob(jobId) {
  const updatedSavedJobIds = [];

  for (let i = 0; i < savedJobIds.length; i++) {
    if (savedJobIds[i] !== jobId) {
      updatedSavedJobIds.push(savedJobIds[i]);
    }
  }

  if (!saveToStorage("careerHubSavedJobs", updatedSavedJobIds)) {
    showToast("Could not remove the saved job. Please try again.");
    return;
  }

  savedJobIds = updatedSavedJobIds;
  render();
  showToast("Job removed");
}

// Remove a submitted application from the list
function removeApplication(applicationId) {
  const updatedApplications = [];

  for (let i = 0; i < applications.length; i++) {
    if (applications[i].applicationId !== applicationId) {
      updatedApplications.push(applications[i]);
    }
  }

  if (!saveToStorage("careerHubApplications", updatedApplications)) {
    showToast("Could not remove the application. Please try again.");
    return;
  }

  applications = updatedApplications;
  render();
}

// Show or hide a popup
function openModal(modal) {
  modal.hidden = false;
}

function closeModal(modal) {
  modal.hidden = true;
}

// Show complete job information in the details modal
function showJobDetails(job) {
  jobDetails.innerHTML = `
    <h2>${escapeHTML(job.title)}</h2>
    <p><strong>Company:</strong> ${escapeHTML(job.company)}</p>
    <p><strong>Location:</strong> ${escapeHTML(job.location)}</p>
    <p><strong>Type:</strong> ${escapeHTML(job.type)}</p>
    <p><strong>Skills:</strong> ${escapeHTML(job.skills)}</p>
    <p><strong>About this role:</strong> ${escapeHTML(job.description)}</p>
    <p><strong>Salary:</strong> ${escapeHTML(job.salary)}</p>
    <p><strong>Posted:</strong> ${escapeHTML(job.postedDate)}</p>
  `;

  openModal(jobModal);
}

// Open the application form for the selected job
function showApplicationForm(job) {
  selectedJob = job;
  applicationJobTitle.textContent = job.title;
  applicationForm.reset();
  clearFormFeedback();
  openModal(applicationModal);
}

// Clear the form message
function clearFormFeedback() {
  formMessage.textContent = "";
  formMessage.className = "form-message";
}

// Show an error and focus the field that needs attention
function showFormError(message, field) {
  clearFormFeedback();
  formMessage.textContent = message;
  formMessage.className = "form-message error-message";
  field.focus();
}

// Display a short status message
function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(function () {
    toast.classList.remove("is-visible");
  }, 2600);
}

// Make an application ID that is not already in the saved list
function createApplicationId() {
  let applicationId = "";
  let idAlreadyExists = true;

  while (idAlreadyExists) {
    applicationId = "application-" + nextApplicationNumber;
    nextApplicationNumber += 1;
    idAlreadyExists = false;

    for (let i = 0; i < applications.length; i++) {
      if (applications[i].applicationId === applicationId) {
        idAlreadyExists = true;
      }
    }
  }

  return applicationId;
}

// Validate fields and add one application per job
function submitApplication(event) {
  event.preventDefault();

  const name = applicantName.value.trim();
  const email = applicantEmail.value.trim();
  const message = coverMessage.value.trim();
  const atPosition = email.indexOf("@");
  const dotPosition = email.lastIndexOf(".");

  if (name === "") {
    showFormError("Please enter your full name.", applicantName);
    return;
  }

  if (
    email === "" ||
    atPosition < 1 ||
    atPosition !== email.lastIndexOf("@") ||
    dotPosition < atPosition + 2 ||
    dotPosition === email.length - 1 ||
    email.includes(" ") ||
    email.includes("..") ||
    email.charAt(0) === "." ||
    email.charAt(atPosition - 1) === "."
  ) {
    showFormError("Please enter a valid email address.", applicantEmail);
    return;
  }

  if (message === "") {
    showFormError("Please enter a cover message.", coverMessage);
    return;
  }

  clearFormFeedback();

  let duplicateApplication = false;

  for (let i = 0; i < applications.length; i++) {
    if (applications[i].jobId === selectedJob.id) {
      duplicateApplication = true;
    }
  }

  if (duplicateApplication) {
    formMessage.textContent = "You have already applied for this job.";
    formMessage.className = "form-message error-message";
    showToast("You have already applied for this job");
    return;
  }

  const updatedApplications = [];

  for (let i = 0; i < applications.length; i++) {
    updatedApplications.push(applications[i]);
  }

  const newApplication = {
    applicationId: createApplicationId(),
    jobId: selectedJob.id,
    jobTitle: selectedJob.title,
    company: selectedJob.company,
    name: name,
    email: email,
    message: message,
    appliedDate: new Date().toLocaleDateString()
  };
  updatedApplications.push(newApplication);

  if (!saveToStorage("careerHubApplications", updatedApplications)) {
    formMessage.textContent = "Your application could not be saved. Please try again.";
    formMessage.className = "form-message error-message";
    return;
  }

  applications = updatedApplications;
  render();
  formMessage.textContent = "Your application for " + selectedJob.title + " was submitted successfully.";
  formMessage.className = "form-message success-message";
  showToast("Application submitted");
  applicationForm.reset();
}

// Update search results as the user types
searchInput.addEventListener("input", function () {
  render();
});

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    render();
  }
});

searchButton.addEventListener("click", render);
typeFilter.addEventListener("change", render);
locationFilter.addEventListener("change", render);
sortFilter.addEventListener("change", render);

clearFiltersButton.addEventListener("click", function () {
  searchInput.value = "";
  typeFilter.value = "All Types";
  locationFilter.value = "All Locations";
  sortFilter.value = "default";
  render();
});

applicationForm.addEventListener("submit", submitApplication);

closeModalButton.addEventListener("click", function () {
  closeModal(jobModal);
});

closeApplicationButton.addEventListener("click", function () {
  closeModal(applicationModal);
});

jobModal.addEventListener("click", function (event) {
  if (event.target === jobModal) {
    closeModal(jobModal);
  }
});

applicationModal.addEventListener("click", function (event) {
  if (event.target === applicationModal) {
    closeModal(applicationModal);
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    if (!applicationModal.hidden) {
      closeModal(applicationModal);
    } else if (!jobModal.hidden) {
      closeModal(jobModal);
    }
  }
});

render();

const savedJobsStored = saveToStorage("careerHubSavedJobs", savedJobIds);
const applicationsStored = saveToStorage("careerHubApplications", applications);

if (!savedJobsStored || !applicationsStored) {
  showToast("Some browser data could not be saved.");
}
