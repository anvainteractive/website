(() => {
  const cfg = window.ANVA_CONFIG;
  const data = window.ANVA_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const icon = (name) => `assets/icons/${name}.svg`;

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function updateIndicator() {
    const active = $(".nav-link.active");
    const tabs = $("#desktopNav");
    const indicator = $("#navIndicator");
    if (!active || !tabs || !indicator || getComputedStyle(tabs).display === "none") return;
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.transform = `translateX(${active.offsetLeft - 3}px)`;
  }

  function routeFromHash() {
    const raw = location.hash.replace(/^#/, "") || "home";
    if (raw.startsWith("hub/post/")) return { route: "hub", post: raw.split("/")[2] };
    const valid = ["home", "assistance", "status", "events", "hub"];
    return { route: valid.includes(raw) ? raw : "home" };
  }

  function showRoute(route, postId) {
    $$(".route").forEach(panel => panel.classList.toggle("active", panel.dataset.routePanel === route));
    $$(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.route === route));
    $$("#mobileMenu a").forEach(link => link.classList.toggle("active", link.dataset.route === route));
    updateIndicator();
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

    if (route === "hub" && postId) {
      requestAnimationFrame(() => {
        const post = document.getElementById(`post-${postId}`);
        if (post) setTimeout(() => post.scrollIntoView({ behavior: "smooth", block: "center" }), 220);
      });
    }
  }

  function handleHash() {
    const { route, post } = routeFromHash();
    showRoute(route, post);
  }

  function renderCompanyCards() {
    $("#companyCards").innerHTML = data.companyCards.map(card => `
      <article class="info-card">
        <div class="card-icon"><img src="${icon(card.icon)}" alt=""></div>
        <div class="tag-row"><span class="tag subtle">${card.tag}</span></div>
        <h3>${card.title}</h3>
        <p>${card.body}</p>
      </article>
    `).join("");
  }

  function renderSupport() {
    $("#supportList").innerHTML = data.supportItems.map(item => `
      <article class="support-item">
        <img src="${icon(item.icon)}" alt="">
        <h3>${item.title}</h3>
        <p>${item.body}</p>
      </article>
    `).join("");
  }

  function renderStatus() {
    const board = $("#statusBoard");
    board.innerHTML = data.services.map(service => `
      <article class="status-row">
        <div class="status-main">
          <div class="card-icon"><img src="${icon(service.icon)}" alt=""></div>
          <div>
            <h3>${service.name}</h3>
            <p>${service.detail}</p>
          </div>
        </div>
        <div class="status-detail">${service.note}</div>
        <span class="status-pill ${service.state}">${service.stateLabel}</span>
      </article>
    `).join("");

    const allOperational = data.services.every(s => s.state === "operational");
    const summary = $("#overallStatus");
    summary.innerHTML = `<span></span>${allOperational ? "All Systems Operational" : "Some Systems Are Limited"}`;
    summary.querySelector("span").style.background = allOperational ? "var(--green)" : "var(--amber)";

    $("#lastUpdated").textContent = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    }).format(new Date());
  }

  let currentEventFilter = "all";
  function renderEvents() {
    const filtered = data.events.filter(e => currentEventFilter === "all" || e.state === currentEventFilter);
    $("#eventTimeline").innerHTML = filtered.map(event => `
      <article class="event-card">
        <div class="event-date">${event.date}</div>
        <div class="event-body">
          <p class="kicker">${event.type}</p>
          <h3>${event.title}</h3>
          <p>${event.description}</p>
        </div>
        <div class="event-meta">
          <span class="tag subtle">${event.tag}</span>
          <span class="status-pill ${event.state === "past" ? "operational" : "development"}">${event.state === "past" ? "Past" : "Upcoming"}</span>
        </div>
      </article>
    `).join("") || `<div class="info-card"><h3>No events here yet.</h3><p>New ANVA milestones will appear here when they are added to the site data.</p></div>`;
  }

  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }
  };

  const likeKey = "anva:hub:likes";
  const countKey = "anva:hub:like-counts";
  const viewKey = "anva:hub:views";
  const sessionViewed = new Set();

  function getHubState() {
    return {
      liked: store.get(likeKey, {}),
      likes: store.get(countKey, {}),
      views: store.get(viewKey, {})
    };
  }

  function renderHub() {
    const state = getHubState();
    $("#hubFeed").innerHTML = data.hubPosts.map(post => {
      const liked = !!state.liked[post.id];
      const likes = Number(state.likes[post.id] || 0);
      const views = Number(state.views[post.id] || 0);
      return `
        <article class="hub-post" id="post-${post.id}" data-post-id="${post.id}">
          <div class="post-top">
            <div>
              <p class="kicker">${post.category}</p>
              <h2>${post.title}</h2>
            </div>
            <span class="post-date">${post.date}</span>
          </div>
          <div class="tag-row">${post.tags.map(tag => `<span class="tag subtle">${tag}</span>`).join("")}</div>
          <div class="post-body">${post.body.map(p => `<p>${p}</p>`).join("")}</div>
          <div class="post-actions">
            <button class="post-action like-action ${liked ? "liked" : ""}" data-like="${post.id}" aria-pressed="${liked}">
              <img src="${icon("heart")}" alt=""><span>${likes}</span>
            </button>
            <span class="post-action" title="Views stored on this device">
              <img src="${icon("eye")}" alt=""><span data-view-count="${post.id}">${views}</span>
            </span>
            <button class="post-action post-share" data-share="${post.id}">
              <img src="${icon("share")}" alt=""><span>Share</span>
            </button>
          </div>
        </article>
      `;
    }).join("");

    bindHubActions();
    observeHubViews();
  }

  function bindHubActions() {
    $$("[data-like]").forEach(button => button.addEventListener("click", () => {
      const id = button.dataset.like;
      const state = getHubState();
      const nowLiked = !state.liked[id];
      state.liked[id] = nowLiked;
      state.likes[id] = Math.max(0, Number(state.likes[id] || 0) + (nowLiked ? 1 : -1));
      store.set(likeKey, state.liked);
      store.set(countKey, state.likes);
      button.classList.toggle("liked", nowLiked);
      button.setAttribute("aria-pressed", String(nowLiked));
      button.querySelector("span").textContent = state.likes[id];
    }));

    $$("[data-share]").forEach(button => button.addEventListener("click", async () => {
      const id = button.dataset.share;
      const post = data.hubPosts.find(p => p.id === id);
      const directUrl = `${location.href.split("#")[0]}#hub/post/${id}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: post.title, text: post.body[0], url: directUrl });
          return;
        } catch (err) {
          if (err && err.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(directUrl);
        toast("Post link copied");
      } catch {
        window.prompt("Copy this link:", directUrl);
      }
    }));
  }

  function observeHubViews() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < .45) return;
        const id = entry.target.dataset.postId;
        if (sessionViewed.has(id)) return;
        sessionViewed.add(id);
        const state = getHubState();
        state.views[id] = Number(state.views[id] || 0) + 1;
        store.set(viewKey, state.views);
        const counter = document.querySelector(`[data-view-count="${id}"]`);
        if (counter) counter.textContent = state.views[id];
      });
    }, { threshold: [.45] });

    $$(".hub-post").forEach(post => observer.observe(post));
  }

  function bindUI() {
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("resize", updateIndicator);

    const menuButton = $("#menuButton");
    const mobileMenu = $("#mobileMenu");
    menuButton.addEventListener("click", () => {
      const open = mobileMenu.hidden;
      mobileMenu.hidden = !open;
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.querySelector("img").src = icon(open ? "close" : "menu");
    });
    $$("#mobileMenu a").forEach(a => a.addEventListener("click", () => {
      mobileMenu.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.querySelector("img").src = icon("menu");
    }));

    $("#assistanceButton").addEventListener("click", () => {
      if (!cfg.assistanceHubUrl) {
        toast("Add your Discord invite in js/config.js");
        return;
      }
      window.open(cfg.assistanceHubUrl, "_blank", "noopener,noreferrer");
    });

    $$("#eventFilters .segment").forEach(button => button.addEventListener("click", () => {
      $$("#eventFilters .segment").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      currentEventFilter = button.dataset.eventFilter;
      renderEvents();
    }));
  }

  renderCompanyCards();
  renderSupport();
  renderStatus();
  renderEvents();
  renderHub();
  bindUI();
  handleHash();
  requestAnimationFrame(updateIndicator);
})();
