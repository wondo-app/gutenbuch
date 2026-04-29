// =====================================================
// Chapter 3 — Scheme
// =====================================================

=== scheme_intro_alt ===
[PROSE: Slower beat. Ray walks them through the patriotic frame. Jenks objects; Lisbeth amplifies the objection. Ray rationalizes. Eventually concedes the briefing should happen.]
-> scheme_briefing

=== scheme_briefing ===
[PROSE: Ray lays out Halloran Vance — the financier behind the ethnoreligious-nationalist apparatus. Network, lieutenants, rallies, donors. Ray explains the plan: Jenks possesses Vance, dismantles from inside. Branch: how to prepare.]
~ act = scheme
+ [Bring Lisbeth in on the research — she has the journalist's instincts] -> scheme_research
+ [Keep it tight: just Ray and Jenks, no leaks] -> scheme_solo

=== scheme_research ===
[PROSE: Lisbeth digs. Open-source intelligence on Vance's calendar, his security detail, his social patterns. Jenks watches, terrified. Ray writes notes pretending to be a war room. Lisbeth's competence shifts something between her and Jenks.]
~ lisbeth_bond = lisbeth_bond + 1
~ scheme_progress = scheme_progress + 1
~ lisbeth_warmth = lisbeth_warmth + 1
-> climax_intro

=== scheme_solo ===
[PROSE: Just Ray and Jenks. Ray dictates, Jenks listens. Green hovers, unhelpful. The room gets smaller; Ray's narration gets more pompous. Jenks becomes a tool in Ray's mind, not a person.]
~ ray_self_importance = ray_self_importance + 1
~ jenks_terror = jenks_terror + 1
-> climax_intro
