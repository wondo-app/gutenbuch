=== demonstration_arrival ===
After describing Porky's plight, Lisbeth and Baldy were nonplussed. Even skeptical. But Porky, more gloomy than ever at all this discussion, waved away their doubts.

"Then let me show you," he declared. "Pick anybody out there on the street. Anybody at all." He shoved his armchair back up to the open window, with the three of us standing around behind him.

"Will it hurt him?" Lisbeth asked.

"It won't hurt Porky," I said. "But it might very easily hurt the other fellow." I gripped Porky by the shoulder. "Listen, you've evidently had a lot of luck so far. You haven't killed anybody, have you?"

He looked horrified. "Killed anybody? Oh my heavens no! How could I…"

"Suppose while you have possession of some stranger, you got killed? Or committed suicide, for instance? It only takes you a second to withdraw, as you put it. So you'd be sitting here in your chair, but the other fellow would be dead or framed for murder."

"Don't quibble," Baldy said. "Let's see him do it. That's the important part." Baldy has a good imagination, which is why his cartoons are so successful. "If he can do a thing like that, it's a gift," Baldy added with mounting enthusiasm. "Why, we can capitalize on it in a thousand ways — maybe make a fortune."

"I just want to be rid of it," Porky said. "But here goes."
~ baldy_excitement = baldy_excitement + 1
-> old_woman_demo

=== old_woman_demo ===
He showed us all right.

A meek-looking old woman with a shawl over her head and an umbrella under her arm happened to come along, and at the busy intersection just under my window she stood looking confused, as though afraid of the traffic.

"Try her," Baldy suggested. "She looks like a weak character."

"Doesn't seem to make any difference. But she'll do."

We were tense, all of us. I was trying to watch the old woman and Porky simultaneously. She stood on the corner, nervously waiting for the light to change, then seemed afraid to start across because cars were turning from the side street. Here in the chair, Porky just took a good long intense look at his victim. I saw a sort of predatory look jump into his pale blue eyes. And then he sat back in his chair with a hand up to his forehead.

Then it happened. Down on the corner the old woman seemed to start; for a second she looked dazed; she gave a twitch. Here in the chair was a thud. Porky's head falling back inert against the upholstery, and there he lay, motionless, in a trance it seemed. Lisbeth gave a frightened little gasp.

"I'm sure he's all right," I murmured.

"Shut up," Baldy admonished. "Look there. Oh migosh, look at the old woman!"

She was something to look at. The light had changed back, but that didn't stop her. With imperious, if shaking, steps, she strode out from the curb, holding up a hand to stop the traffic. By some miracle nothing hit her. And at the exact center of the intersection she stopped.

"Oh-h," I heard Baldy murmur. "She's gonna direct the traffic!"

That was undoubtedly her general idea. She had the closed umbrella gripped in her hand, holding it over her head as she gestured for cars to stop or come forward. Quite a sight. In a minute or two there were a lot of sounds — cars honking, drivers yelling, the grinding-bumping crash of a couple of minor collisions.

Then the policemen reached her, gripped her. The old woman stiffened and went limp in their arms; and here in the chair Porky gave a twitch, his head coming up, his eyes open staring at me with a nervous smile.

"Well, there you have it," he said.
~ porky_hosts += old_woman
~ baldy_excitement = baldy_excitement + 1
-> after_demo

=== after_demo ===
Beyond any doubt the old woman was in trouble. Four policemen were telling her off; then a radio car came and they bundled her into it.

"That's tough," Baldy murmured. "How's she gonna explain it? She'll wind up in Bellevue."

"Well, he didn't intend it," Lisbeth said, then turned on me. "Why don't you go down there and do something about it? Get her off. You can just tell them…"

"Not me," I said. "You go. And I'll come to the asylum and try to get you out. This whole thing is crazy, and anybody connected with it…"

"It may be crazy, but it works," Baldy declared, mounting his soapbox. "Listen, you lugs. Don't you realize what we've got? A gold mine. Fame. Fortune. We'll put Porky in the movies."

"I don't want to be in movies," Porky said.

"Vaudeville, then. The scientific wonder of the age. He takes possession of various people in the audience and spills their secrets."

"Wouldn't that make him popular," I retorted.

It was then, I confess, that the big idea came to me. Money is wonderful, but what with all the publicity the war was getting, naturally it was on your mind even more than money. How could we use Porky's gift to help with the war?

I had a vivid imagination, and the thought gave it an immense stimulus. I was about to lay it out when I noticed Lisbeth watching me with the same expression she used to have when I tried to explain what was funny about a bad joke.

+ [Speak up. The war's bigger than any of us.] -> support_war
    ~ baldy_excitement = baldy_excitement + 1
+ [Tread carefully. Lisbeth's right that Porky's not a tool.] -> dial_back
    ~ porky_anxiety = porky_anxiety - 1
    ~ lisbeth_alarm = lisbeth_alarm - 1
+ [Let Lisbeth pull Porky aside before this goes anywhere.] -> lisbeth_intervenes

=== support_war ===
I told them. Nazi submarines, lurking off our coast, we knew that. We go down near Sandy Hook. Porky doesn't actually have to see his victim, that's been demonstrated. He just mentally selects one of the lurking submarines and takes possession of its Commander. Has the Commander run the sub up on shore and smash it. Or open a valve and sink it. Or blow it up with one of its own torpedoes. In one split second he jumps out to the safety of his own body, which is with us on shore. Then he jumps into another sub. Then another. The Battle of the Atlantic is the big hitch in our war effort. Why, this would change everything.

"And kill himself, too," Lisbeth murmured. "Dad, I thought you had better sense than this."

"Not at all," I said. But Baldy was already on it, getting bigger by the second. When Hitler finds his subs aren't coming back and so on, and from there to the Emperor's battleships, Japan's generals ordering their men in the wrong direction, what chaos, what a cinch.

Porky, very quietly: "Well, I won't do it."

"Listen, you big hunk of junk," Baldy said, "are you going to put your own personal safety ahead of a chance to win the war for Uncle Sam?"

"More than just a chance," I added, "practically a sure thing."

"All right, I'll try it. I'm no coward, if you go and put it that way. Only I sure hope it works."
-> planning_evening

=== dial_back ===
I started to say it, and then I caught Lisbeth's expression and let it taper into something more measured. The submarines, yes, but only if Porky was sure. Only as a test. One sub just see how the withdrawal worked from a body in real danger.

Porky listened, his hands shaking a little. "I sure hope it works," he said.

Baldy was disappointed in me — I could see him deflating from a vaudeville impresario back into a cartoonist. But he conceded that one sub was better than none.

"All right," Porky said. "I'll try it. Just the one. Just to see."
~ porky_anxiety = porky_anxiety + 1
-> planning_evening

=== lisbeth_intervenes ===
"Wait," Lisbeth said. She hadn't said much for a while, but the way she said wait was the way her mother used to. Baldy and I both shut up.

She turned to Porky. "I want to talk to you. Outside. Now."

Porky followed her like a man who has been thrown a rope in a flood. They went out into the hall. Through the door I could hear, faintly, Lisbeth's voice — low, urgent, kind. After a few minutes they came back in, and Porky looked entirely different. Not cured, exactly, but seen.

"I've decided," he said. "I'm going to keep working on it. But not like that. Not for the war."

Baldy started to object. Lisbeth gave him a look that shut him up.

I said, "Lisbeth!"

"Dad. He came here for help. So we're going to help him. Actually help him."

And that, more or less, was that.
~ lisbeth_alarm = lisbeth_alarm - 1
-> early_quiet_love

=== planning_evening ===
We planned it for about an hour. About eleven o'clock that same night, we'd all go quietly down near Coney Island or Sandy Hook and go to work on the first sub that came within Porky's range. The range was an unknown quantity, but as far as any of us could figure, there wasn't any reason why his astral body couldn't jump a mile or ten miles just as well as from my window down into the street.

"Well, let's go to dinner," I said.

"I was thinking I would take Lisbeth to dinner," Porky said. "Just to talk things over, you know." He gazed at her with shy confusion, and she gazed back.

"I'd like that," Lisbeth said. "Come on, let's go."

"And you be back here by eleven o'clock promptly," I warned. "Because the war depends on you."

"Should you go AWOL," Baldy put in, and he didn't smile when he said it, "I will personally see that you get put into an insane asylum for the rest of your natural life."

It occurred to me to mention that Porky could jump out of an insane asylum without much trouble, but I decided to keep that to myself.

About quarter past eleven, Lisbeth and Porky came back. They had been to a double-feature movie — Love's Lingering and Passion's Pretty Flowers. They were very happy about it. But they sobered down when I mentioned that Porky had the fate of the war on his hands; and by the time we got down to the seashore, Porky was looking a little white around the gills.

~ went_to_beach = true
~ act = beach
-> beach_intro
