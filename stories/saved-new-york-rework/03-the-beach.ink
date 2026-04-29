// =====================================================
// Chapter 3 — The Beach
// =====================================================

// Stub for chapter 2's early-out: routes forward to the canonical ending in
// chapter 4 without skip-jumping. Mechanically a no-op; structurally it makes
// chapter 2 releasable on its own when Wondo serializes.
=== early_quiet_love ===
The whole submarine business was not to be. Hitler kept his subs and we lost the ones we lost. None of it had anything to do with us really. Whatever was strange about Porky stayed in his boarding house room, and then in Lisbeth's company, and then, well.

~ act = morning_after
-> morning_after_intro

=== beach_intro ===
We sat Porky down on the sand. It was a lonely stretch, with the waves rolling up in long rhythmic lines of white and the open sea a deep purple with leaden clouds overhead and a wan moon trying to break through.

"Now then, make yourself comfortable," I told Porky as we stretched him out. "We'll be right here by you all the time."

That didn't seem to comfort him much. "I sure hope this thing works," he said weakly.

With the fate of the world at stake, I sure hoped so myself; but I wasn't going to express any doubts. Baldy and I sat down and lit up our pipes.

"Just keep your mind on the nearest submarine Commander," I said. "Then jump in. Go to work. Then *withdraw*. You'll be back here with us instantaneously. It's a cinch."

"I sure hope so," he agreed.

"Nazi submarine Commander," Baldy added with sudden thought. "There might be a U.S. sub out there, Porky. Now listen carefully. Don't you get the sides mixed."

"It's just plain suicide, that's what it is," Lisbeth murmured resentfully.

Porky stretched on the sand with his head and shoulders propped up by his elbows. We held our breaths. For a minute or two he just stared moodily out at the purple sea, concentrating. Then he gave a twitch. His body stiffened, then went limp. There was a little thud as his head and shoulders fell back onto the sand. Lisbeth gave a suppressed cry. Baldy and I exhaled and went back to puffing at our pipes. You've got to have poise in a thing like that.

Time passed. The wind picked up.

+ [Lisbeth gasped — a great cascade of water, far out, and the impossible silhouette of a green man-shape rising from the sea.] -> green_giant_path
+ [A low, distant *thump*. Then another. Out where the U-boats run, something that should be intact has stopped being intact.] -> direct_sub_path

=== green_giant_path ===
We all saw it at once. Out in front of us, half a mile out maybe, a great green man-shape towered two or three hundred feet into the air, wading waist deep in the water, parallel to the beach, toward Sandy Hook.

How can I describe him? I can't. Not adequately. He was too awesome, too weird, too incredible. But there he was. Five or six hundred feet tall, glistening green scales, slimy sea-look as though algae and barnacles might be clustered on it. A face you couldn't call human. He was breathing through his mouth with a snort that was a gruesome rumbling roar, but I could see he had gills in the sides of his neck.

Then a great many amazing things began to happen all more or less simultaneously. In the town behind us the air-raid siren began wailing. Searchlights from several spots on shore sprang up like waving silver swords. And far out to sea there was the drone of planes.

An air raid. New York being raided by Nazi planes. Four of them, flying low. The moonlight disclosed it. Hitler had picked this particular night to make good on his threat.

What happened next was chaos. One Nazi plane swerved low over the Green Giant. Suddenly the giant let out a bellow of anger; his hand reached up a hundred feet over his head and grabbed the plane. Seized it, crunched it, flung it away. The plane fell into the sea as a long finger of yellow-red flame.

I heard Baldy mutter: "Good work! Very neat!"

*Good work.* That tipped me off. Porky. By some mischance for Hitler, Porky landed in the giant.

~ porky_hosts += green_giant
~ sub_possessed = false
-> green_aftermath

=== green_aftermath ===
The Nazi pilots gave up their ideas of heading up the bay and circled like confused birds. The giant stooped, or should I say Porky stooped, and came up out of the sea with a monstrous dripping boulder. He flung it; another plane crashed.

Baldy was on his feet, pumping a fist. Lisbeth was on her knees in the sand beside Porky's body, crying without seeming to notice.

+ [Watch the rest. The giant has them.] -> green_finish
+ [Tell Porky to push for the subs out there too.] -> green_press
+ [Get Porky out. Now. Spectators are forming on the beach.] -> green_scattered

=== green_finish ===
A lot of our own interceptors were coming now, going at the two remaining Nazis like wasps. One was shot down. Porky took the last one with a marvelous standing high jump, grabbing the Nazi plane with both hands and tearing it into bits.

But Hitler had subs around. One of them obviously let loose a couple of torpedoes at the giant. I saw two explosions at his waistline — torpedoes that must have gone right into him and exploded inside. The giant doubled up with a bellowing roar of pain that rattled our eardrums and went down, sinking with a cataclysmic rush of white waves over him.

Porky's body on the sand gave a convulsive shudder, and he was sitting up, blinking, with a hand rubbing his forehead.

"W-well," Porky said. "Here you are. What happened?"

"Plenty," I said. "But you did fine, Porky."

~ porky_returned = true
-> withdrawal_check

=== green_press ===
"Tell him — somehow to *go for the subs*," I muttered, but Porky was already in the giant and the giant was already turning. He waded deeper, where the U-boats were. He went under. The water churned where his head had been.

Then a long stretch of nothing. No body, no giant, no signs.

"Where is he?" Lisbeth whispered.

"He's working," Baldy said. But his voice had a hollow in it.

A minute. Two minutes. The body on the sand had not moved. Porky's chest rose and fell in long, slow waves, but his eyes did not open. The giant did not surface. The U-boats, wherever they had been, gave no further sign.

After ten minutes, Lisbeth took my arm and held it the way a child holds an adult's hand at a funeral.

"He went too far in," she said. "He went where the giant couldn't come back from."

~ porky_returned = false
-> withdrawal_check

=== green_scattered ===
~ secrecy_intact = false
We tried to wake him. Lisbeth slapped his face, gently and then less gently. Baldy was already up the beach, shouting at Coast Guards.

But the bodies on the sand, Porky's body, our four bodies, were no longer alone. Spectators in coats over pajamas. A man with a flashlight. A woman who'd been on her porch when the air-raid siren went and now stood at the dune line with her hand over her mouth, looking at the long churn of water where the giant had been and then at us.

The man with the flashlight came over. "Was that you?" he asked.

It is a terrible question. There is no good answer.

~ porky_returned = true
-> withdrawal_check

=== direct_sub_path ===
A long minute. Then another. Porky's body lay inert. You could hardly tell that he wasn't dead. I could feel Lisbeth's gaze roving Baldy and me like we were a couple of murderers.

And then nothing dramatic happened, which was exactly what we'd been hoping for. No air-raid siren. No cascade. Just minutes ticking by, and Porky's body breathing slowly on the sand, and the suggestion, somewhere out in the dark water, of a German submarine quietly going where its Commander was now telling it to go.

"He's in," I murmured.

"He's in," Baldy agreed.

After perhaps four minutes there was a low, distant sound. Not an explosion exactly, more a *thump*, the kind of sound water makes when something large under it has stopped being intact. A few seconds later, another *thump*.

Porky's body twitched and his eyes opened, dazed.

"It worked," he whispered. "Ray, it worked. The Commander, I had him. We were running it onto the rocks. The crew didn't see it coming. Then I got out."

~ porky_hosts += sub_commander
~ sub_possessed = true
~ porky_returned = true
-> direct_aftermath

=== direct_aftermath ===
Baldy was on his feet. "Now listen, the U-boat Commanders are still out there. All we have to do —"

+ [That's enough for one night. One sub gone is one sub gone.] -> direct_retreat
+ [Do it again. Now. While the body's warm and the gift is awake.] -> direct_press
+ [Get out before this stretch of beach figures out who we are.] -> direct_scattered

=== direct_retreat ===
"That's enough for one night," I said, and I was surprised at how much I meant it. "One sub is one sub. We come back tomorrow. And then again after until we get these Nazis."

Lisbeth let out a breath I hadn't heard her holding.

We helped Porky stand. He was wobbly but on his feet. We walked back along the dunes, the four of us, very quietly, the way you walk when you have just gotten away with something and you are not yet sure with what.

-> withdrawal_check

=== direct_press ===
"Once more," I told Porky. "While we know it works."

Porky looked at Lisbeth. She didn't say anything. She looked at the water.

"All right," Porky said. "Once more."

He stretched out again. Concentrated. Twitched. Went limp.

We waited. A long time, this time. Long enough that Baldy and I stopped talking and just sat. The wind kept picking up. Far out — closer than the last one — another low *thump*. And another, fainter, farther. The sub had taken at least two of them with it. We waited for Porky to come back.

+ [He came back. Eyes open, breathing fast, sweating. Close, he said. Close.] -> direct_press_safe
+ [He didn't come back. The body on the sand stopped breathing.] -> direct_press_lost

=== direct_press_safe ===
He came back. Eyes open, breathing fast, sweating.

"Close," he said. "I almost — Ray, I almost didn't make it. They had a crewman on him. I think the crewman shot him. I got out maybe a half-second before."

But he had gotten out. And down at the rocks, where the first sub had run aground, there was now another. And out beyond it, the ocean was quietly minus a third.

~ porky_returned = true
-> withdrawal_check

=== direct_press_lost ===
He didn't come back.

I am putting it that simply because the alternatives, *he was in too long*, *the withdrawal failed*, *the explosion took him with it*, are all true and none of them are sufficient. The body on the sand kept breathing for a few minutes more, and then it stopped. Lisbeth was holding his hand. We were too far from any kind of help that would have helped.

Out on the water, three submarines were not coming back to Berlin.

~ porky_returned = false
-> withdrawal_check

=== direct_scattered ===
~ secrecy_intact = false
We tried to wake him. Lisbeth slapped his face, gently and then less gently. Baldy was already up the beach, shouting at Coast Guards.

But the bodies on the sand, Porky's body, our four bodies, were no longer alone. Spectators in coats over pajamas. A man with a flashlight. A woman who stood at the dune line with her hand over her mouth, looking at the dark water where her radio had just told her something terrible was happening, and then at us.

The man with the flashlight came over. "Was that you?" he asked. "Are *you* doing this?"

It is a terrible question. There is no good answer.

~ porky_returned = true
-> withdrawal_check

=== withdrawal_check ===
~ act = morning_after
-> morning_after_intro
