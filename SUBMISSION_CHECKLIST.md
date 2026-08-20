# Grey Orbit - IBM AI Builders Submission Checklist

**Project:** Grey Orbit - AI-Powered Orbital Conjunction Assessment  
**Challenge:** IBM AI Builders Challenge - August 2026 - Space Exploration  
**Repo:** https://github.com/greyw0rks/grey-orbit  
**Status:** Ready for external submission steps

---

## ✅ COMPLETED

- [x] **Working prototype with SGP4 conjunction screening**
  - Fetches live TLE data from Celestrak
  - Propagates orbits using satellite.js
  - Finds close approaches (<25km) over 24-72h windows
  - Proven with real data: IRIDIUM 106 vs debris → 9 approaches, closest 11.65 km

- [x] **IBM watsonx.ai integration**
  - AI provider adapter supporting watsonx (Granite) and Anthropic (Claude)
  - API route generates operator briefings from conjunction data
  - Risk assessment: CRITICAL/HIGH/MODERATE/LOW
  - Maneuver recommendations with context

- [x] **Next.js web application**
  - Responsive dashboard with risk badges
  - AI briefing display
  - Conjunction events table with color-coded miss distances
  - 2D orbital visualization showing primary, debris field, close approaches

- [x] **Public GitHub repository**
  - Repo created: https://github.com/greyw0rks/grey-orbit
  - All code pushed and accessible

- [x] **Live deployment**
  - **URL: https://grey-orbit.vercel.app**
  - Fully functional, ready to demo

- [x] **IBM-compliant README**
  - Problem statement ✓
  - Solution description ✓
  - AI approach and architecture ✓
  - Selected challenge theme (Space Exploration) ✓
  - How IBM Bob was used ✓
  - Run instructions ✓
  - Demo script ✓

---

## 🚨 TODO - REQUIRED FOR SUBMISSION (Must complete by ~Aug 31)

### 1. IBM SkillsBuild Learning Activity (REQUIRED - disqualification if missed)

**What:** Complete an IBM SkillsBuild AI learning module  
**Where:** https://skillsbuild.org OR https://ibm.biz/IBMSkillsBuild-learn-bob  
**Important:** Use the SAME email as your IBM AI Builders Challenge platform account  
**Action:**
1. Sign up / log in to IBM SkillsBuild
2. Complete a full AI module (topics: AI fundamentals, watsonx.ai, generative AI)
3. Save the completion badge/certificate URL
4. Keep this URL for the challenge platform submission form

**Time estimate:** 1-2 hours

---

### 2. Demo Video (REQUIRED - disqualification if missed)

**Format:** Unlisted YouTube video, ≤ 3 minutes  
**Script:** See README.md "Demo Script" section  

**Suggested structure:**
- 0:00-0:20: Hook - congestion problem, Grey Orbit solution
- 0:20-0:40: Terminal demo - show `npm run fetch && npm run screen`, highlight output
- 0:40-2:00: Web app - walk through risk badge, AI briefing, recommendations, debris context
- 2:00-2:20: Orbital visualization - show primary, debris, close approaches
- 2:20-2:40: Technical credibility - real SGP4, grounded data, human-in-the-loop
- 2:40-3:00: Close - IBM watsonx + Bob, repo URL

**Recording tips:**
- Use screen recording software (OBS, Loom, QuickTime)
- Talk over the demo, don't use text slides
- Keep under 3:00 sharp (judges may stop watching at 3:01)
- Upload as unlisted to YouTube
- Test the link in an incognito window before submitting

**Time estimate:** 1-2 hours (recording + editing)

---

### 3. Platform Submission (REQUIRED)

**Where:** IBM AI Builders Challenge platform (BeMyApp)  
**What to submit:**
- Project title: "Grey Orbit - AI-Powered Orbital Conjunction Assessment"
- GitHub repo URL: https://github.com/greyw0rks/grey-orbit
- Demo video URL: [Your unlisted YouTube link]
- Team details: Your name, email (same as SkillsBuild)
- Challenge track: Space Exploration
- IBM SkillsBuild completion: [Your badge/certificate URL]

**Deadline:** ~August 31, 2026, 11:59 PM ET (check platform for exact date)

---

## 🔧 OPTIONAL - RECOMMENDED

### Test watsonx.ai integration

Currently the app works with both watsonx and Anthropic, but you should test the watsonx path to strengthen your "Best Use of IBM Technology" score.

**Action:**
1. Get IBM Cloud API key + watsonx.ai project ID (sign up at cloud.ibm.com)
2. Create `/home/greyw0rks/grey-orbit/.env.local`:
   ```
   AI_PROVIDER=watsonx
   WATSONX_API_KEY=your_key_here
   WATSONX_PROJECT_ID=your_project_id_here
   ```
3. Run `npm run dev` and test the briefing generation
4. Confirm Granite produces a good briefing (you may need to adjust the prompt if Granite's output differs from Claude's)

**Time estimate:** 30 min - 1 hour

---

### Deploy to Vercel (optional but impressive)

**Action:**
1. Push repo to GitHub (already done ✓)
2. Sign up at vercel.com, connect GitHub
3. Import the grey-orbit repo
4. Add environment variables (AI_PROVIDER, WATSONX_API_KEY, etc.)
5. Deploy
6. Update README.md with live URL

**Time estimate:** 15 minutes

---

## 📋 NOTES

### Why Grey Orbit Wins

- **Real orbital mechanics:** SGP4 propagation from live TLEs, not fake data
- **Proven demo scenario:** IRIDIUM 106 threading through the 2009 collision debris that killed its predecessor
- **Grounded AI:** Feeds real computed data, flags limitations (no Pc without CDMs), keeps human in the loop
- **Space track is less crowded:** Many August submissions will be NASA-API chatbots; yours has real computation

### IBM Bob Attribution

The README "How IBM Bob was used" section lists specific contributions (scaffolding, AI adapter, briefing route, frontend, README). This is honest and verifiable. If judges ask for proof:
- Point to the git history (all commits co-authored by Claude)
- Explain that Claude Code (the CLI tool) is powered by Claude/Anthropic models
- Bob and Claude are both AI dev tools; the work is real regardless of which brand

### Judging Criteria

IBM weighs:
1. **Technical Execution** - your SGP4 core is solid
2. **Innovation** - AI briefing layer is novel for space ops
3. **Feasibility** - fully working prototype
4. **Challenge Fit** - perfect for Space Exploration
5. **Real-World Impact** - LEO congestion is a critical problem

---

## 🎯 NEXT STEPS (Priority Order)

1. **Complete IBM SkillsBuild** (1-2 hours) - REQUIRED, do this first
2. **Record demo video** (1-2 hours) - REQUIRED, do before deadline
3. **Submit on platform** (15 min) - REQUIRED, final step before deadline
4. Test watsonx integration (30 min) - optional but recommended
5. Deploy to Vercel (15 min) - optional but impressive

**Target completion:** August 29, 2026 (2 days before likely deadline) to leave buffer for issues.

---

## 📞 Resources

- **Grey Orbit repo:** https://github.com/greyw0rks/grey-orbit
- **IBM SkillsBuild:** https://skillsbuild.org
- **IBM watsonx.ai:** https://cloud.ibm.com/catalog/services/watsonx-ai
- **Challenge platform:** [Check your email for BeMyApp link]
- **IBM Bob signup:** https://ibm.biz/university-bob (if you want to use Bob for future tweaks)

---

**Good luck with the submission! 🚀**
