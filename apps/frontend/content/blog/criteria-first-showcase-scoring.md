---
title: "Criteria-First Scoring: Demystifying Portfolio Project Evaluation with Live Health Diagnostics"
date: "2026-10-24"
description: "Why traditional algorithmic scoring feels like a black box, and how our transparent rubric-first architecture empowers developers to inspect and customize project weights before scores are computed."
tags: ["Architecture", "Quality", "DevOps", "Next.js", "TypeScript"]
---

Software developers are inherently skeptical of black-box metrics. When a portfolio platform displays an arbitrary badge like *"Project Score: 78/100"*, the immediate question every engineer asks is: 

> *"What does 78 even mean? Who decided my project lost 22 points, and how can I fix it?"*

Most platforms compute quality scores through hidden algorithms, leaving candidates guessing. In the latest release of **Portfolio Showcase**, we flipped this paradigm upside down by introducing **Criteria-First Scoring** paired with real-time **Deployment Health Probes**.

---

## 1. The UX Rule: Show How Projects Are Graded FIRST, Then Show Scores

Our core interface requirement was unambiguous: **Developers must see the grading dimensions, maximum weights, and evaluation logic before they are presented with a final score.**

When you open any project showcase (`/dashboard/projects/[id]`), the layout prioritizes transparent rubric criteria:

| Dimension | Max Points | Evaluation Logic |
| :--- | :--- | :--- |
| **Live Deployment & Health** | 30 pts | Actively responds with HTTP 200/300 on production host |
| **Source Code Repository** | 25 pts | Verified public repository link allowing code review |
| **Technology Breadth** | 20 pts | Full-stack completeness (4+ tagged technologies) |
| **Documentation Deep-Dive** | 15 pts | Architectural breakdown, performance metrics, and diagrams |
| **Title & Overview Clarity** | 10 pts | Clear naming convention and executive problem statement |

Only after understanding this objective rubric does the user see the **Calculated Workability Dial** (0–100 PTS) with points earned per category.

---

## 2. Server-Side Health Probing with Graceful Fallbacks

A project link in a resume is only as good as its uptime. Dead links (HTTP 404, 502, expired domain names) immediately degrade credibility with engineering recruiters.

We built an on-demand health verification engine in NestJS (`ProjectsService.checkHealth`):

```typescript
// Fast asynchronous health probe
async checkHealth(id: string) {
  const project = await this.findOne(id);
  if (!project.liveUrl) return { healthStatus: 'NO_LINK' };

  let status = 'NO_LINK';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Try low-overhead HEAD request first
    let res = await fetch(project.liveUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'PortfolioShowcase-HealthCheck/1.0' },
    }).catch(async () => {
      // Fallback to GET if the target CDN blocks HEAD requests
      return await fetch(project.liveUrl!, {
        method: 'GET',
        signal: controller.signal,
      });
    });

    clearTimeout(timeoutId);

    if (res && res.status >= 200 && res.status < 400) {
      status = 'ONLINE';
    } else if (res && res.status >= 400 && res.status < 600) {
      status = 'DEGRADED';
    }
  } catch (err) {
    status = 'OFFLINE';
  }
}
```

By capping the request timeout at **4000ms** and employing `HEAD` requests before falling back to `GET`, the probe uses virtually zero network bandwidth while dynamically updating the project's workability score in real time.

---

## 3. The Interactive Rubric Customizer

Not all engineering work fits into a single rubric mold:
- A backend engineer building a high-throughput C++ data pipeline might not have a public frontend web URL, but their GitHub repository and technical documentation are stellar.
- A designer/frontend engineer may prioritize a live Vercel deployment and visual case study over raw repository commits.

To accommodate this, we introduced the **Rubric Customizer**:

```
[Customize Rubric Weights]
Live URL Weight:       [ 10 ] pts (e.g. CLI tool / backend library)
Repo Link Weight:      [ 40 ] pts (emphasize open-source code)
Technology Breadth:    [ 25 ] pts
Documentation Depth:   [ 20 ] pts
Overview Clarity:      [  5 ] pts
Total: 100 pts
[ Save & Recalculate Score ]
```

When updated, the backend normalizes the points against the user's custom weights and re-scores the project instantly.

---

## What's Next?

By establishing transparent, criteria-first quality metrics, portfolio authors now have an actionable roadmap for every project they build. A developer can immediately see: *"Adding 100 words of architectural notes will boost my score from 75 to 88."*

*Read our companion post on active session security and cold-start resilience to see how we hardened our authentication layer!*
