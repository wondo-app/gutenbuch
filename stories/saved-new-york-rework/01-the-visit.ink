// =====================================================
// Chapter 1 — The Visit
// =====================================================

=== start ===
It was a warmish afternoon last spring and I was sitting in my study trying to figure out a plot. Thats the kind of trouble a writer gets into when nothing in the world wants to be written about and that's when Porky Jenks came in to see me.

I used to know Porky quite well though hadn't seen him in two years. Likeable young fellow, always with a ready laugh, which is why his nickname stuck, I suppose. But this was a different Porky. He wedged himself down, collapsing in my only armchair. His clothes were rumpled as though he'd slept in them; his collar was wilted, hanging soggily on his bulging throat. His thin sandy hair was plastered on his sweating forehead; he pulled out a big blue handkerchief and mopped his face and just stared at me with pale blue eyes that looked haunted.

"Well, well, Porky, glad to see you," I said. "How are you?"

"I'm awful," he declared. He tried to laugh but it was only a wan, sickly grin. "There's something the matter with me, Ray. Something terrible. That's why I've come to you, see? You're up on all that nutty stuff. The bizarre, the queer, the unbelievable…"

"Oh," I said.

He told me the rest in fits and starts. His ego, id, personality or *something* didn't seem to want to stay put in his body anymore. A week ago he'd been sitting by his window when suddenly he wasn't himself at all — he was a man walking down the street past his window, a perfectly strange man, henpecked and late getting home. He'd ducked into a Bar and Grill, absorbed whiskeys, and *withdrawn* before things got out of hand.

I sat with this for a moment. I've juggled with weird things like that for years — strictly on paper, you understand. Facing the paranormal in real life gave me the creeps. Because Porky was telling me the truth. I wouldn't doubt it. He was visibly frightened out of his wits.

+ [Show me. Right now. I want to see it work.] -> push_for_demo
    ~ porky_anxiety = porky_anxiety + 1
+ [Slow down. Tell me everything that's happened first.] -> hear_full_story
+ [Have you been to a doctor?] -> doctor_question

=== push_for_demo ===
"Show me," I said. "Right now. Easy enough — let's look out my window. You just pick out anybody."

Porky gulped, but he nodded. "Sure. All right." He shoved the armchair up to the open window and sat himself down. The street below was a slow Tuesday afternoon: a hat-shop sign, a streetcar grinding around the corner, a kid in short pants chasing a dog.

"Just so you won't think I'm crazy," Porky said. He gripped the arms of the chair. "Pick anybody, Ray. Anybody at all."

I was about to pick someone when a knock at the door froze the question.
~ porky_hosts += first_man
-> end_of_visit

=== hear_full_story ===
He told me more. The henpecked husband at the bar. Porky spilling all the man's secret thoughts about his wife to the bartender, and then withdrawing before things got into a real jam. The little woman upstairs in his boarding house who'd suddenly socked her bruiser of a husband and fled the room. That was Porky too, just last night, taking sides in a marital argument he'd happened to inhabit. He didn't even have to *see* the host body, he told me. The woman upstairs had been a voice through a ceiling. He'd just slid in.

"Ray, a fellow shouldn't be able to do a thing like this. It's not normal, is it?"

"No. Not exactly normal. But you're not sick? Nothing else seems to be the matter?"

"No. If I wouldn't be so scared I guess I'd feel all right." He said as he shuddered. He wanted me to tell him what to do. I didn't know what to tell him. I was still working out, in the way a writer does, whether what he was describing was a tragedy or an opportunity.
~ lisbeth_alarm = lisbeth_alarm + 1
~ porky_hosts += henpecked_couple
-> end_of_visit

=== doctor_question ===
"Have you been to a doctor?"

He recoiled from the chair as though I'd slapped him. "A doctor? Ray, are you nuts? They'd put me away. They'd put me in Bellevue and they'd never let me out. That's why I came to you. You write the stuff. You're supposed to know what to do about it."

"I write the stuff strictly on paper. It's not the same."

"No," he agreed, dejected. "I guess not. But Ray, please, I can show you. It's easy enough. I just need somebody to tell me what to do."

He looked exactly like a man who has been through a week of trying to holding himself together and was now trying to give the secret away with both hands. I was about to answer when a knock at the door froze the question.
~ porky_anxiety = porky_anxiety + 1
-> end_of_visit

=== end_of_visit ===
The knock at the door was Lisbeth and Baldy Green walking in on us.

Lisbeth is my daughter. A nice girl, good looking with a mop of unruly wavy brown hair. She wants to be a career girl. A newspaper reporter of the sob-sister variety, big by-line, holding down the City Desk and carrying the paper. Baldy is a cartoonist on one of the big dailies; middle-aged, with a wife and six kids, a good friend of mine. He'd just gotten Lisbeth a job on his paper. Neither of them had ever met Porky Jenks and now was not exactly Porky's finest.

I made the introductions. And because *somebody* had to explain Porky's frightened aspect, and maybe I didn't look too normal mysely, I thought I'd better explain the problem in hand.

~ act = demonstration
-> demonstration_arrival
