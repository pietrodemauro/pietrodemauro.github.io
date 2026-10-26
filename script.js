/**
 * GitHub API Integration & Dynamic Repo Loader
 * 
 * Replace 'YOUR_GITHUB_USERNAME' with your actual GitHub username.
 */
const GITHUB_USERNAME = "pietrodemauro"; // <-- Inserisci qui il tuo vero username GitHub!

document.addEventListener("DOMContentLoaded", () => {
  // Set dynamic current year in footer
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Update profile and footer links if not set
  updateGithubLinks(GITHUB_USERNAME);

  // Fetch repositories from GitHub API
  fetchGithubRepositories(GITHUB_USERNAME);
});

function updateGithubLinks(username) {
  if (!username || username === "YOUR_GITHUB_USERNAME") return;

  const profileLink = document.getElementById("profile-github-link");
  if (profileLink) {
    profileLink.href = `https://github.com/${username}`;
  }

  const footerLink = document.querySelector(".footer-github-link");
  if (footerLink) {
    footerLink.href = `https://github.com/${username}`;
  }
}

async function fetchGithubRepositories(username) {
  const container = document.getElementById("repos-container");
  const countBadge = document.getElementById("repo-count-badge");

  if (!container) return;

  // Curated fallback projects in case GitHub API limit is hit or username is still default
  const fallbackRepos = [
    {
      name: "robotics-motion-planning",
      html_url: `https://github.com/${username}`,
      description: "Trajectory optimization & obstacle avoidance algorithms for 6-DoF robotic manipulators in ROS2.",
      language: "C++",
      stargazers_count: 14,
      forks_count: 5
    },
    {
      name: "reinforcement-learning-control",
      html_url: `https://github.com/${username}`,
      description: "Actor-Critic (PPO / SAC) implementations for adaptive continuous state control in PyTorch.",
      language: "Python",
      stargazers_count: 22,
      forks_count: 8
    },
    {
      name: "autonomous-slam-vision",
      html_url: `https://github.com/${username}`,
      description: "Visual-Inertial Odometry and 3D point cloud mapping with Kalman filtering and OpenCV.",
      language: "Python",
      stargazers_count: 9,
      forks_count: 2
    },
    {
      name: "industrial-mpc-benchmark",
      html_url: `https://github.com/${username}`,
      description: "High-speed Model Predictive Control benchmarking on simulated multi-input multi-output systems.",
      language: "MATLAB",
      stargazers_count: 7,
      forks_count: 1
    }
  ];

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();

    // Filter out forks if you only want personal original repos, or keep them
    const filteredRepos = repos.filter(repo => !repo.fork);
    const displayList = filteredRepos.length > 0 ? filteredRepos : repos;

    if (displayList.length === 0) {
      renderRepositories(container, fallbackRepos);
      if (countBadge) countBadge.textContent = "Showing sample repositories";
      return;
    }

    if (countBadge) {
      countBadge.textContent = `${displayList.length} Public Repositories`;
    }

    renderRepositories(container, displayList);
  } catch (err) {
    console.error("GitHub API fetch error:", err);
    if (countBadge) countBadge.textContent = "Unable to load repositories";
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem; border: 1px dashed var(--border-light); border-radius: var(--radius-md); text-align: center; color: var(--text-secondary);">
        <p style="margin-bottom: 0.75rem;"><i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i> Could not load repositories automatically (rate limit or network issue).</p>
        <a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="display: inline-flex;">
          <i class="fa-brands fa-github"></i> View @${username} on GitHub
        </a>
      </div>
    `;
  }
}

function renderRepositories(container, repos) {
  container.innerHTML = "";

  repos.forEach(repo => {
    const card = document.createElement("a");
    card.href = repo.html_url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.className = "repo-card";

    const languageColor = getLanguageColor(repo.language);

    card.innerHTML = `
      <div>
        <div class="repo-header">
          <i class="fa-regular fa-folder-open"></i>
          <span class="repo-badge"><i class="fa-solid fa-arrow-up-right-from-square"></i> View</span>
        </div>
        <h3 class="repo-title">${escapeHTML(repo.name)}</h3>
        <p class="repo-desc">${escapeHTML(repo.description || "Research codebase & implementation.")}</p>
      </div>
      <div class="repo-footer">
        <div class="repo-lang">
          <span class="lang-circle" style="background-color: ${languageColor}"></span>
          <span>${escapeHTML(repo.language || "Code")}</span>
        </div>
        <div class="repo-stats">
          <span title="Stars"><i class="fa-regular fa-star"></i> ${repo.stargazers_count ?? 0}</span>
          <span title="Forks"><i class="fa-solid fa-code-fork"></i> ${repo.forks_count ?? 0}</span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function getLanguageColor(lang) {
  const colors = {
    "Python": "#52525b",
    "C++": "#3f3f46",
    "C": "#71717a",
    "MATLAB": "#52525b",
    "Rust": "#3f3f46",
    "JavaScript": "#71717a",
    "HTML": "#a1a1aa",
    "Jupyter Notebook": "#52525b"
  };
  return colors[lang] || "#71717a";
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
