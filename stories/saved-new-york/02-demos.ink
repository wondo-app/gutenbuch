// =====================================================
// Chapter 2 — Demos
// =====================================================

=== demos_arrival ===
[PROSE: Lisbeth and Green walk in unannounced. Lisbeth is your daughter, an aspiring journalist on Green's paper / outlet. Green is the friend who got her the job, looking for a clip-economy angle. Introductions, awkwardness, Jenks's terror visible.]
+ [Welcome Lisbeth into the conversation — she's a reporter, she might help] -> demo_first
    ~ lisbeth_bond = lisbeth_bond + 1
    ~ lisbeth_warmth = lisbeth_warmth + 1
+ [Wave Lisbeth off — Green's the one who matters here] -> demo_first
    ~ ray_self_importance = ray_self_importance + 1
    ~ lisbeth_warmth = lisbeth_warmth - 1

=== demo_first ===
[PROSE: Jenks demonstrates on a passerby visible from the window — an old woman who suddenly steps into traffic, directs cars with imperious confidence, then collapses limp when Jenks withdraws. Police scoop her up. Cummings's traffic-directing scene, modernized.]
~ scheme_progress = scheme_progress + 1
~ jenks_hosts += first_passerby
~ jenks_terror = jenks_terror + 1
~ vance_in_news = vance_in_news + 1
-> demo_second

=== demo_second ===
[PROSE: Demonstration #2. Jenks slips into the body of a neighbor seen through a window — a man arguing with his wife. Brief, contained, returns Jenks shaking. Green is electric, pitching monetization. Lisbeth is alarmed.]
~ scheme_progress = scheme_progress + 1
~ jenks_hosts += neighbor
~ act = demos
~ ray_self_importance = ray_self_importance + 1
~ vance_in_news = vance_in_news + 1
+ [Move straight to the war angle — Vance, the network, the real target] -> scheme_briefing
+ [Pause. Sit with it. Walk Lisbeth and Jenks through the implications first] -> scheme_intro_alt
    ~ lisbeth_warmth = lisbeth_warmth + 1
    ~ jenks_terror = jenks_terror - 1
