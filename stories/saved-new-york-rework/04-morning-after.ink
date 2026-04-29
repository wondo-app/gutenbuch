// =====================================================
// Chapter 4 — The Morning After
// Endings live here. This file is the last shippable chapter.
// =====================================================

=== morning_after_intro ===
The next day, Baldy and I made charts in regular military fashion, outlining our exact plan of campaign — or, in some versions of how the previous night had gone, we made no charts and pretended nothing had happened. We didn't see anyone else that afternoon, or evening but we had promised faithfully to report at my study by eleven p.m. right on the dot.

{
    - !secrecy_intact:
        -> ending_exposed
    - went_to_beach && !porky_returned:
        -> ending_porky_lost
    - went_to_beach && sub_possessed:
        -> ending_war_won
    - else:
        -> ending_quiet_love
}

// =====================================================
// Endings — each is one knot of prose terminating in a divert to its END_* knot.
// =====================================================

=== ending_quiet_love ===
"Well," I said. "Here you are. That's fine. And you look in good shape for a swell night's work, Porky."

"Yes, sir," Porky agreed. "I'm all right. But you see, sir, there's er…something we want to tell you."

That *sir* sounded sort of queer, but I admit I didn't get the idea.

"He loves me and I love him and so it's all settled," Lisbeth said.

Baldy looked startled. What I looked like I don't know.

"What's all settled?" I demanded.

"Us, er…we're engaged," Porky stammered.

"It absolutely is," Lisbeth beamed. "He loves me and I love him. Definitely."

To say I was nonplussed would be putting it mildly. But I have always prided myself on having a true sense of values. What's the problem of a daughter compared to the problem of winning the war? Nothing. Nothing at all.

"Well, we'll talk about that later," I decided firmly. "Right now we've got a war on our hands. Come on, let's get going."

But Porky didn't look at all as though he were ready to start.

"Well," he said, "that's another thing I have to tell you." He looked very pleased. "I haven't got it any more. I've lost it."

Baldy came to life. "What's *that* mean? What in the devil haven't you got any more? What have you lost?"

"My gift. That's what you called it," Porky said. "It's gone. Vanished. I can't do it any more. I tried, honest I did, but it's certainly gone."

Lisbeth made an expressive gesture like one who wants to indicate that a fairy has just flown out the window.

"He tried," she said. "He really did."

"Because now your soul and heart and ego and such are all tied up with Lisbeth," Baldy said sarcastically.

"That's it," Lisbeth retorted. "And you don't need to be sarcastic about it. He and I figured it all out. Why would his ego want to roam abroad when it's in my keeping, forever?" She and Porky were holding onto each other's hands and gazing with that dying-calf look.

And there you are. I'm sorry about not being personally able to win the war, but you can see, there wasn't a thing I could do about it.
-> END_quiet_love

=== ending_war_won ===
"Well," I said. "Here you are. Ready for round two?"

Porky nodded. He looked tired but steady. Lisbeth, beside him, was holding his hand tightly enough that I could see the white of her knuckles. She didn't say anything.

We went out that night, and the night after, and the night after that. The sub came up on the rocks. Or it didn't come up at all and we found out a week later from a paper, a paper we couldn't believe printed it but they did, that two German submarines had been recovered off our coast in conditions the Navy described as "consistent with internal sabotage." The German command, the article speculated, had a leak. They were spending more on counterintelligence than on torpedoes.

Porky kept doing it. We never told anybody. Lisbeth didn't speak to me much that month. She watched Porky like a person watching something she loved fall down a well in slow motion. He came back every time, but a little less of him, and we couldn't say it but we were paying for what we got, and we knew.

By the fourth month, the U-boat campaign was effectively broken. Hitler was rationing fuel for Atlantic operations. The papers said Allied strategy. The papers said improved sonar. The papers said a lot of things. Nobody said Porky.

I tried to write about it once, years later, and burned the manuscript when Lisbeth read three pages and walked out of the room.

There you are. We won the war. You're welcome. I won't be needing the credit.
-> END_war_won

=== ending_porky_lost ===
Lisbeth came in. I'd wished Porky was standing there beside her. She just stood in the doorway of my study with her coat still on and her face composed in the particular way faces compose themselves when there has been crying earlier and there will be crying later but right now there is something to be said.

"He never come back," she said.

I stood up. Baldy stood up.

"At the beach," she said. "Last night. He went in for the second sub. Or maybe it was the third, I lost count, I lost *count*, Dad. And eventually the body on the sand stopped breathing, and I don't know if it was the body or him or what, but the body stopped, and an hour later I was riding in an ambulance with a corpse, and I thought you should know."

Baldy sat down very slowly.

"Lisbeth," I started.

"No," she said. "Not yet. I don't want to hear it yet."

She told us the rest in a flat administrative voice. The hospital had it down as a heart attack. There would be a small funeral. His parents in Indiana didn't know about me, or her, or any of it. The boarding house room would need to be cleared.

She did not say *you killed him*. She did not have to. We sat with her in my study until the gray of morning came up against the window, and then she got up and put her coat on properly and left.

I have not, since, written about anything that mattered. I tell myself I will. But you can see, there isn't a thing I can do about it.
-> END_porky_lost

=== ending_exposed ===
The headline, when it came, was on the third page of the *Daily News* and ran eight columns wide:

**SANDY HOOK "GIANT" SIGHTED, TWO COAST GUARDSMEN, FISHERMAN AGREE. NAVY DENIES!**

There was a sketch. The sketch was reasonably accurate. There were quotes. The fisherman had been a hundred yards offshore in his boat. The two Coast Guardsmen had been a half-mile down the beach. They all said the same thing: a green man-shape, hundreds of feet tall, in the water.

What they did not see, but what other people did, was the three of us sitting around a body on the sand.

The reporters found Porky first. He was easy to find. Barding house, hardware-salesman background, the kind of person you can locate by lunchtime if you know how to use a phone. He told them the truth, which was the worst possible answer. The Bellevue intake desk took down his particulars and a doctor I had never met made a determination I could not appeal.

Lisbeth held it together for two days. Baldy got a lawyer.

I held a press conference. I told them I was a writer of pulp fiction, that the entire affair was a publicity stunt of which I had been the principal architect, and that the green giant was a hoax of my devising whose mechanics I would not disclose because hoaxes are properly mysterious. The reporters wrote it up. They liked it. It was easier to print than the alternative.

Porky was released after eleven weeks, on the condition that he never speak of it. He doesn't. He and Lisbeth got married the following spring, in a small ceremony I did not attend because I was, by then, a footnote in someone else's expose, and I thought my presence would attract the wrong sort of attention.

I'm sorry about all of it. I don't expect to be believed.
-> END_exposed

// Terminal stubs — required for verify-ink's distribution parser to find each
// declared ending name. Each just terminates the story.

=== END_quiet_love ===
-> END

=== END_war_won ===
-> END

=== END_porky_lost ===
-> END

=== END_exposed ===
-> END
