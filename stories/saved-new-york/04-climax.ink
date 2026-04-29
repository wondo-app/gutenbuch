// =====================================================
// Chapter 4 — Climax
// =====================================================

=== climax_intro ===
[PROSE: The night before the attempt. Vance is somewhere — a fundraiser, a rally, a private dinner. Jenks's body is here, in Ray's apartment. The room is quiet; everyone is awake. Ray narrates the moment he believes is historic.]
~ act = climax
+ [Push the attempt — it's now or never; Jenks goes in] -> vance_attempt
+ {lisbeth_bond >= 2} [Lisbeth pulls Jenks aside — and he goes with her] -> fallout_love
+ [Hesitate. Don't commit. Let it sit overnight] -> fallout_doubt

=== vance_attempt ===
[PROSE: Jenks lies on Ray's couch. Closes his eyes. The room holds its breath. Ray narrates with the swagger of a man writing his own legend in real time.]
~ vance_confronted = true
+ {scheme_progress >= 3} [Jenks lands clean — he is Vance, looking out through Vance's eyes] -> vance_inhabited
+ {scheme_progress < 3} [Jenks lands wrong — he is somewhere loud, in a body that isn't one body] -> mob_misfire

=== vance_inhabited ===
[PROSE: Jenks-as-Vance moves through Vance's evening. Sends emails, signs documents, says things at a microphone that destroy the network from inside. Ray watches Jenks's body twitch on the couch. The withdrawal moment approaches.]
~ jenks_hosts += right_target
+ [Withdraw the moment the work is done — clean exit] -> ending_armchair
+ [Linger — make sure the damage holds; one more press release, one more recorded confession] -> ending_pyrrhic

=== mob_misfire ===
[PROSE: Jenks is briefly the rally — not a person, a mass. The institutional misfire: he's experiencing being a crowd, the consensual hallucination of belief, the collective scream. He emerges altered. The misfire is on every feed within minutes.]
~ jenks_hosts += misfire_host
~ secrecy_intact = false
+ [Aim for Vance again, frantically — and miss into the lawyer instead] -> wrong_target_arc
+ [Aim sideways — Vance's strategist, his consigliere] -> pyrrhic_strategist
+ [Withdraw and let the misfire go viral on its own terms] -> ending_exposed

=== wrong_target_arc ===
[PROSE: Jenks lands in Vance's lawyer. Wrong man, but not nothing — the lawyer signs documents, breaks privilege, hands Vance's structure to investigators before withdrawing. The network cracks anyway. Ray was wrong about the target and right about the outcome. The credit is impossible.]
~ jenks_hosts += wrong_target
-> ending_armchair

=== pyrrhic_strategist ===
[PROSE: Jenks lands in Vance's strategist. Does damage — real damage — but the withdrawal is harder from a body the strategist was already losing. Jenks's body on the couch goes still. Ray watches. Lisbeth's hand is on his arm and then it isn't.]
-> ending_pyrrhic
