// =====================================================
// Chapter 5 — Fallout
// Endings live here (this is the final chapter; cannot be released without endings).
// =====================================================

=== fallout_doubt ===
[PROSE: The hours stretch. Ray rationalizes; Jenks paces; Lisbeth says nothing. Green watches the news. Ray's narration pretends to be patient.]
~ act = fallout
+ [Tell Lisbeth what you almost did — the truth, all of it] -> fallout_love
    ~ lisbeth_bond = lisbeth_bond + 1
+ [Stew. Tell no one. Wait for the moment to come back around] -> ending_exposed

=== fallout_love ===
[PROSE: Jenks and Lisbeth have a conversation Ray isn't part of. They come back holding hands. Jenks tries the gift again — nothing. The gift is gone. Lisbeth has it now in some way Ray cannot articulate. Cummings's canonical close, modernized.]
~ act = fallout
-> ending_quiet_love

// =====================================================
// Endings
// =====================================================

=== ending_quiet_love ===
-> END_quiet_love

=== ending_armchair ===
-> END_armchair_fool

=== ending_pyrrhic ===
-> END_pyrrhic

=== ending_exposed ===
-> END_exposed

=== END_quiet_love ===
[PROSE: Canonical-as-dominant. Jenks and Lisbeth are together; the gift is gone; Vance is still on every channel. Ray writes a novel about it that nobody reads. Sardonic shrug. "Not a thing I could have done."]
-> END

=== END_armchair_fool ===
[PROSE: The scheme works. Vance's network is in pieces, indictments rolling. Ray is anonymous. The world goes on without knowing how it was saved. Ray's next novel doesn't sell. Sardonic deflation.]
-> END

=== END_pyrrhic ===
[PROSE: Jenks is gone. His body went still on Ray's couch and didn't come back. Vance is destroyed; the network unrooted. Ray cannot grieve in public because no one knows. Lisbeth doesn't speak to him. Sardonic, but the sardonic costs more now.]
-> END

=== END_exposed ===
[PROSE: The story leaks — through Lisbeth's byline or Green's clip economy or simply the misfire's virality. Jenks is committed; Ray is a footnote in someone else's longread. Vance pivots, weaponizes the story, comes out stronger. The schemer's vanity is the public record.]
-> END
