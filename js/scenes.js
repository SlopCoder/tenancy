/* ============================================================
   SCENES
   ============================================================ */

const scenes = {

  /* ---- ACT I: ARRIVAL ----------------------------------- */

  opening: {
    label: 'Arrival',
    text: [
      "You haven't been to this part of the country in fifteen years. The road from the highway is narrower than you remember, the trees taller. There is a gas station you don't recognize and a house you do, which is strange, because you have never lived here. You drive past it without looking too long.",
      "The lawyer's letter is on the passenger seat. You glance at it twice without reading it. You know what it says.",
      "The house appears on your left exactly where the directions promised. White paint going gray. A porch sagging slightly to one side. A name on the mailbox you've already decided not to read.",
      "You park. You sit for a moment with the engine off, listening to it tick. There is no other sound. You take the key from the envelope. It is heavier than you expected, and warmer than the day.",
    ],
    choices: [
      { label: "Get out of the car.", next: 'porch', effects: { item: ['lawyer_letter', 'house_key'], silentItem: true } },
      { label: "Read the lawyer's letter first.", next: 'letter', effects: { path: -1, item: ['lawyer_letter', 'house_key'], silentItem: true } },
    ],
  },

  letter: {
    label: 'Arrival',
    text: [
      "You unfold it again. The paper is good — heavy, slightly textured. The lawyer's name is at the top in a font that has been in use since before you were born. <em>Hollings, Hollings & Tipton, attorneys at law, established 1899.</em> They have written this letter as if you and they have spoken before. As far as you can recall, you have not.",
      "The name of the deceased is in the second paragraph. You read it. You feel nothing in particular. You try to picture them and what you produce is the back of a head, turned away, in a room you can't place.",
      "The letter says the house was left to you in full. There are no other beneficiaries. There is no requirement to keep it. Title is clear. Taxes have been paid through the end of the year. The keys, the deed, and a folder containing the property's full history are at the house, in the front hall drawer.",
      "There is a paragraph at the bottom — three lines, the prose flatter than the rest. It notes that the previous occupant requested specifically that the house not be sold to a stranger, and that the bequest was made on those grounds. It does not say what the previous occupant's relationship to you was, only that they considered themselves to have one.",
      "You fold the letter again and put it in your inside pocket. It is the kind of thing you might want to consult later.",
    ],
    choices: [
      { label: "Get out of the car.", next: 'porch' },
    ],
  },

  porch: {
    label: 'Front Porch',
    room: 'porch',
    text: [
      "The porch boards give a little under your weight but do not creak. Someone replaced them within the last twenty years; you can see the change in the grain. Whoever did it left the original boards on the two outer corners, where it would have been hardest to match.",
      "The doorbell has been painted over so many times it is now a smooth pale lozenge. You don't try it. You put the key in the lock and turn.",
      "The door opens inward without resistance.",
    ],
    choices: [
      { label: "Step inside.", next: 'front_hall', effects: { note: "Two boards on the porch are older than the others. Someone cared." } },
    ],
  },

  front_hall: {
    label: 'Front Hall',
    room: 'front_hall',
    text: (s) => {
      if (s.act === 1) return [
        "The air inside is cooler than the air outside and smells faintly of old paper. There is a coat-rack on your right with nothing on it. A runner carpet down the center of the hall, worn pale where feet have travelled.",
        "On the small table by the wall there is a tin of butterscotch sweets. The lid is on. There is no dust on it.",
        "To your left, a doorway opens onto the living room. Ahead, the hall continues past the stairs to the kitchen. The stairs go up.",
      ];
      // Act II Walter variant
      if (dominantInhabitant() === 'walter') return [
        "You stop in the doorway. The shoes by the wall are angled forty-five degrees from the baseboard, and you know — without thinking about it — that this is correct.",
        "The tin of butterscotch has been moved one inch to the left. The label is no longer facing the door.",
        "There is a drawer in the small table you did not notice before. It is labelled, in a careful block hand: <em>VISITORS.</em>",
      ];
      // Act II default
      return [
        "The hall is the same and it is not. The runner is the same colour. The coat-rack is empty. The butterscotch is where you left it.",
        "But the air is different. Cooler, or warmer — you cannot tell. Something has been here in the meantime, in a way that nothing being here also counts as something.",
      ];
    },
    choices: (s) => {
      if (s.act === 1) {
        const unique = Object.keys(s.visited).length;
        const opts = [];
        if ((s.visited.front_hall || 0) <= 1) {
          opts.push({ label: "Pick up the tin of butterscotch.", next: 'front_hall_tin', effects: { path: -1, affinity: { walter: 1 }, sting: 'recognition', note: "Butterscotch tin on the hall table. Not dusty." } });
        }
        opts.push(
          { label: "Go into the living room.", next: 'living_room' },
          { label: "Continue toward the kitchen.", next: 'kitchen' },
          { label: "Go up the stairs.", next: 'upstairs_hall' }
        );
        if ((s.visited.front_hall || 0) >= 2) {
          opts.push({ label: "Open the door under the stairs.", next: 'basement' });
        }
        if (unique >= 5) {
          opts.push({ label: "Sit down. You've seen enough for now.", next: 'act_break' });
        }
        return opts;
      }
      // Act II
      const opts = [
        { label: "Open the drawer labelled visitors.", next: 'visitor_drawer', effects: { affinity: { walter: 2 }, path: 1, sting: 'foreign' } },
        { label: "Go to the living room.", next: 'living_room' },
        { label: "Go to the kitchen.", next: 'kitchen' },
        { label: "Go upstairs.", next: 'upstairs_hall' },
        { label: "Go down to the basement.", next: 'basement' },
      ];
      if (dominantInhabitant() !== 'walter') {
        opts.splice(0, 1);
      }
      return opts;
    },
  },

  front_hall_tin: {
    label: 'Front Hall',
    text: [
      "You pick up the tin. It is full. The sweets inside are individually wrapped in faded gold foil. They are not the kind you have seen in a shop for years.",
      "You don't take one. You put the tin back exactly where it was — or as close as you can manage. You step back to look. It seems to be in the same place, and you cannot tell if that is correct.",
    ],
    choices: [
      { label: "Continue exploring.", next: 'front_hall' },
    ],
  },

  visitor_drawer: {
    label: 'Front Hall',
    text: [
      "Inside the drawer there is a notebook. Hardcover, the green of a billiard table, slightly faded along the spine. You open it.",
      "Every page is dated. Every entry is a name, an arrival time, and a departure time, written in the same careful block hand. The first entry is from 1953. The last is from a Tuesday in 1968, three days before some other final thing.",
      "You leaf forward. The pages after that last entry are blank. Then, three quarters of the way through the book, you find a single fresh entry, in fresh ink. Today's date. Your arrival time. The space for departure has been left empty.",
      "The name beside it is not yours, and is.",
      "Beneath the notebook, tucked between two of the back pages, is a small black-and-white photograph mounted on card. A young man and a young woman stand stiffly in front of this house, before either of them has learned what kind of room they will become. On the back, in the same block hand: <em>M and W, before.</em>",
    ],
    choices: [
      { label: "Close the drawer.", next: 'front_hall', effects: { affinity: { walter: 2 }, item: 'photo_w', note: "There is a visitor's notebook in the front hall drawer. My name is in it." } },
    ],
  },

  living_room: {
    label: 'Living Room',
    room: 'living_room',
    text: (s) => {
      const visits = s.visited.living_room;
      if (s.act === 1) return [
        "Two couches, one of them sagging worse than the other. A coffee table with a single ring on it from a glass that had been left there for a long time. A standing lamp in the corner. The curtains are drawn, but the cloth is thin enough that the light comes through.",
        "There is a radio on the side table, a wooden cabinet model older than the couches. The dial is set between stations. You can almost hear something behind the dead air, if you stand still.",
        "Cable channels run along the baseboards, taped down with electrical tape that has gone the colour of weak tea.",
      ];
      if (dominantInhabitant() === 'marta') return [
        "The curtains have been pulled back. Sun is in the room in a way it was not, before. There is a Patricia Highsmith novel face-down on the arm of the sagging couch, its spine cracked open at a chapter break.",
        "The radio is on. You can hear it now — the dead air, and behind it, a woman's voice, talking about the weather in a town that no longer exists by that name.",
        "There is a hairclip on the carpet near the couch leg, small and yellow.",
      ];
      if (dominantInhabitant() === 'daniel') return [
        "There is an indentation in one cushion of the sagging couch that exactly fits the seat of a man who used the same cushion for many years. The coffee table has been moved a foot to one side.",
        "The radio is silent. The cable channels along the baseboards are larger than you thought, more of them, terminating in a thick black bundle behind the standing lamp.",
        "On the cushion is a pair of headphones, set down gently, as if their owner expected to come back for them.",
      ];
      // Default Act II
      return [
        "The room is largely as you left it. The cable channels along the baseboard are running in the opposite direction.",
        "You don't remember which direction they ran before.",
      ];
    },
    choices: (s) => {
      if (s.act === 1) {
        return [
          { label: "Try to tune the radio.", next: 'radio_tune', effects: { path: 1, affinity: { marta: 1 } } },
          { label: "Sit on the couch a moment.", next: 'couch_sit', effects: { path: 1, affinity: { daniel: 1 }, sting: 'recognition' } },
          { label: "Examine the cable channels.", next: 'cables', effects: { path: -1, affinity: { daniel: 1 }, note: "Cable channels along the baseboard. Recent, taped down." } },
          { label: "Move on.", next: 'living_room_exit' },
        ];
      }
      // Act II
      const opts = [];
      if (!hasItem('headphones')) {
        opts.push({ label: "Look more carefully at the couch.", next: 'couch_sit', effects: { affinity: { daniel: 1 } } });
      }
      if (hasItem('headphones') && !state.flags.heard_broadcast) {
        opts.push({ label: "Plug the headphones into the radio.", next: 'headphones_on_radio', effects: { affinity: { marta: 1 } } });
      }
      opts.push({ label: "Leave the room.", next: 'living_room_exit' });
      return opts;
    },
  },

  living_room_exit: {
    label: 'Living Room',
    text: ["You step back into the hall."],
    choices: (s) => {
      if (s.act === 1) return [
        { label: "Continue to the kitchen.", next: 'kitchen' },
        { label: "Try the stairs.", next: 'upstairs_hall' },
        { label: "Back to the front hall.", next: 'front_hall_quiet' },
      ];
      return [
        { label: "Front hall.", next: 'front_hall' },
        { label: "Kitchen.", next: 'kitchen' },
        { label: "Upstairs.", next: 'upstairs_hall' },
        { label: "Down to the basement.", next: 'basement' },
      ];
    },
  },

  radio_tune: {
    label: 'Living Room',
    text: [
      "You turn the dial slowly. The static breaks for a moment and you hear a piece of music — strings, lush, mid-century — before it disappears again. You turn the dial back and it does not come back.",
      "You leave the dial where it was when you found it. Almost.",
    ],
    choices: [
      { label: "Step back.", next: 'living_room', effects: { affinity: { marta: 1 }, note: "Music in the radio for a moment. Strings. Older than you." } },
    ],
  },

  headphones_on_radio: {
    label: 'Living Room',
    text: [
      "You unwind the headphones. The radio is old enough that you wonder whether it has a jack at all — and then you find one on the side, narrower than the connectors you are used to. The plug catches in the socket after a kind of resistance that makes you uncertain whether to force it. It catches.",
      "You put the headphones on. The static through them is closer than the room, closer than your own breathing. You turn the dial slowly. More static. Then, between two stations, a wash of strings comes through — lush, mid-century. The music Marta danced to in this room while her daughter was at school.",
      "Behind the strings, very faint, a voice. A man's voice, reading the news of a particular Tuesday in 1973. He talks about a cold front coming in. He mentions an unattended fire in a neighbouring town. He says — and the voice is suddenly nearer, not from the broadcast at all — <em class=\"drift\">behind the stove, where the cold air comes in.</em>",
      "You pull the headphones off. The radio is silent. The dial has been moved one click further than you turned it.",
    ],
    choices: [
      { label: "Set the headphones down.", next: 'living_room', effects: { flag: 'heard_broadcast', affinity: { marta: 2 }, sting: 'revelation', note: "A voice through the headphones said: behind the stove, where the cold air comes in.", foreign: true } },
    ],
  },

  couch_sit: {
    label: 'Living Room',
    text: (s) => {
      if (hasItem('headphones')) return [
        "You sit. The cushion does not feel new under you. You can feel the shape of someone else's habit in the spring beneath the foam. Your shoulders settle into an angle they did not choose.",
        "You stand up almost immediately.",
      ];
      return [
        "You sit. The cushion does not feel new under you. You can feel the shape of someone else's habit in the spring beneath the foam. Your shoulders settle into an angle they did not choose.",
        "As you stand up, your hand brushes against something wedged between the cushion and the arm of the couch. You ease it out: a pair of headphones, the padding worn into a particular shape. The cord is wound and unwound enough times that it has a memory of its own.",
        "You take them with you. You do not know why yet.",
      ];
    },
    choices: (s) => {
      if (hasItem('headphones')) return [
        { label: "Step back.", next: 'living_room', effects: { affinity: { daniel: 1 }, note: "The couch knows another shape better than mine." } },
      ];
      return [
        { label: "Step back.", next: 'living_room', effects: { affinity: { daniel: 1 }, item: 'headphones', note: "Headphones tucked between the couch cushions. The padding remembers another head." } },
      ];
    },
  },

  cables: {
    label: 'Living Room',
    text: [
      "The cables go behind the standing lamp and disappear into a small hole in the wainscot. They were installed by someone who knew what they were doing. They are the only thing in the room that is not at least thirty years old.",
      "You do not follow them.",
    ],
    choices: [
      { label: "Step back.", next: 'living_room' },
    ],
  },

  kitchen: {
    label: 'Kitchen',
    room: 'kitchen',
    text: (s) => {
      if (s.act === 1) return [
        "The kitchen is yellow. Not bright — the yellow of an egg yolk that's been left on a plate. The paint is old. Underneath it, near the door frame, you can see a strip of pale gray where the previous colour shows through.",
        "There is a small table under the window. One chair, pushed in. An ashtray on the table, clean. A spider plant on the sill that is doing better than it should.",
        "The window over the sink looks onto the back of the garden. Someone has put a piece of paper on the inside of the glass, taped at the corners. You can read what it says by going closer, or not.",
      ];
      if (dominantInhabitant() === 'marta') return [
        "The window is open and the kitchen smells of cigarettes. The taped paper is gone. The ashtray on the small table is no longer clean.",
        "On the counter, half a sandwich and a glass of something that is no longer cold. A child's drawing of a sun has been taped to the fridge with the kind of tape they use in schools.",
        "The radio in the next room has been left on, very quietly. You can hear it from here.",
      ];
      if (dominantInhabitant() === 'walter') return [
        "Every drawer has been labelled. Cutlery. Tea Towels. Spare Light Bulbs. Items For The Cellar. The labels are in a careful block hand on small white cards, taped with yellowed cellophane.",
        "The kitchen table has been wiped down so thoroughly that the wood has a faint white ghost across its surface where the cleaner sat too long. A single tea cup, upside down, drying on a folded towel.",
      ];
      return [
        "The kitchen is yellow, and was yellow, and is becoming a different shade of yellow as you watch — though when you look directly, it is the same.",
      ];
    },
    choices: (s) => {
      if (s.act === 1) return [
        { label: "Read the paper on the window.", next: 'kitchen_note', effects: { path: -1, note: "Note on kitchen window: 'Please do not move.' Unsigned." } },
        { label: "Look in the drawers.", next: 'kitchen_drawers', effects: { affinity: { walter: 1 } } },
        { label: "Leave the kitchen.", next: 'kitchen_exit' },
      ];
      const opts = [];
      if (dominantInhabitant() === 'marta') {
        opts.push({ label: "Pick up the child's drawing.", next: 'marta_drawing', effects: { affinity: { marta: 2 }, path: 1 } });
      }
      if (state.flags.heard_broadcast && !hasItem('hairclip')) {
        opts.push({ label: "Reach behind the stove, where the cold air comes in.", next: 'stove_reach', effects: { affinity: { marta: 1 } } });
      }
      opts.push({ label: "Leave the kitchen.", next: 'kitchen_exit' });
      return opts;
    },
  },

  stove_reach: {
    label: 'Kitchen',
    text: [
      "You crouch by the stove. The space behind it is narrow and lined with old grease the colour of weak tea. You feel along the wall. Cool plaster. Cold tin. Cold air coming through a gap in the brick that should not be there.",
      "Then — fabric. You ease it out. A single small yellow hairclip, the kind a child wears when her mother does her hair before school. The plastic is warmer than the air.",
      "You hold it for a moment. You can almost remember the hand that put it here, and the reason it was hidden, and what it was meant to open.",
    ],
    choices: [
      { label: "Stand up.", next: 'kitchen', effects: { item: 'hairclip', affinity: { marta: 2 }, note: "A small yellow hairclip behind the stove. Hidden, not lost." } },
    ],
  },

  kitchen_note: {
    label: 'Kitchen',
    text: [
      "The paper is taped to the inside of the glass. It is a torn piece of an old envelope. In pencil, in handwriting you cannot quite place, it reads: <em>please do not move.</em>",
      "It is unclear whether this addresses you, the paper, or something else entirely.",
    ],
    choices: [
      { label: "Step back.", next: 'kitchen' },
    ],
  },

  kitchen_drawers: {
    label: 'Kitchen',
    text: [
      "You open the top drawer. Cutlery, arranged by size. Beneath the cutlery, a small white card has been taped to the bottom of the drawer. It reads, in a careful block hand: <em>Cutlery.</em>",
      "You close it.",
    ],
    choices: [
      { label: "Step back.", next: 'kitchen', effects: { affinity: { walter: 1 }, note: "All the drawers are labelled. From the inside." } },
    ],
  },

  marta_drawing: {
    label: 'Kitchen',
    text: [
      "It is a sun. A child's sun, with a smiling face and rays in every direction, drawn in crayon on the back of an envelope. The address on the front has been crossed out twice.",
      "You put it back. The piece of tape is older than the drawing.",
    ],
    choices: [
      { label: "Step back.", next: 'kitchen', effects: { affinity: { marta: 1 } } },
    ],
  },

  kitchen_exit: {
    label: 'Kitchen',
    text: ["You step out of the kitchen."],
    choices: (s) => {
      if (s.act === 1) return [
        { label: "Through to the dining room.", next: 'dining_room' },
        { label: "Up the stairs.", next: 'upstairs_hall' },
        { label: "Back to the hall.", next: 'front_hall_quiet' },
      ];
      return [
        { label: "Dining room.", next: 'dining_room' },
        { label: "Front hall.", next: 'front_hall' },
        { label: "Upstairs.", next: 'upstairs_hall' },
      ];
    },
  },

  front_hall_quiet: {
    label: 'Front Hall',
    text: ["You're back in the hall. The light has moved."],
    choices: (s) => {
      if (s.act === 1) {
        const unique = Object.keys(s.visited).length;
        const opts = [
          { label: "Go into the living room.", next: 'living_room' },
          { label: "Continue toward the kitchen.", next: 'kitchen' },
          { label: "Go up the stairs.", next: 'upstairs_hall' },
          { label: "Open the door under the stairs.", next: 'basement' },
        ];
        if (unique >= 5) {
          opts.push({ label: "Sit down. You've seen enough for now.", next: 'act_break' });
        }
        return opts;
      }
      return [
        { label: "Living room.", next: 'living_room' },
        { label: "Kitchen.", next: 'kitchen' },
        { label: "Upstairs.", next: 'upstairs_hall' },
        { label: "Basement.", next: 'basement' },
      ];
    },
  },

  dining_room: {
    label: 'Dining Room',
    room: 'dining_room',
    text: (s) => {
      if (s.act === 1) return [
        "The dining room is mostly a desk. The table that should be in the center has been pushed against the back wall, and a long pine work-desk has taken its place. There is no chair. There is one cable, running up the leg of the desk and disappearing under a stack of paper.",
        "Mug rings on the desk. Six of them, overlapping, in a rough constellation that suggests their owner returned to the same three or four spots for years.",
        "There is a window onto the side yard. The garden visible through it has not been tended in some time.",
      ];
      if (dominantInhabitant() === 'daniel') return [
        "The desk is heavier than it was. The mug rings have multiplied. There is now a chair, an office chair, the wheels of which have worn pale tracks into the carpet over what must be years.",
        "There is a cat hair on the back of the chair, long and black, persistent in the way of someone who has been dead some time.",
      ];
      return [
        "The room is largely as you left it, though the mug rings on the desk look fresher than they should. As if someone had set down a drink an hour ago and was about to come back.",
      ];
    },
    choices: (s) => {
      if (s.act === 1) return [
        { label: "Look at the papers on the desk.", next: 'dining_papers', effects: { path: -1 } },
        { label: "Leave the dining room.", next: 'dining_exit' },
      ];
      return [
        { label: "Sit at the desk a moment.", next: 'desk_sit', effects: { affinity: { daniel: 2 }, path: 1 } },
        { label: "Leave the dining room.", next: 'dining_exit' },
      ];
    },
  },

  dining_papers: {
    label: 'Dining Room',
    text: [
      "The papers are an old project. Hand-drawn diagrams of something with a great many small parts. You don't recognize what it is. The dates in the corner span four years.",
      "Underneath the diagrams there is a printed photo, faded. Three cats, photographed separately, at different times of their lives. Beneath each photo, a name. Bach, Mahler, Glass.",
    ],
    choices: [
      { label: "Set the papers down.", next: 'dining_room', effects: { affinity: { daniel: 1 }, note: "Three cats: Bach, Mahler, Glass. Not at the same time." } },
    ],
  },

  desk_sit: {
    label: 'Dining Room',
    text: [
      "You don't mean to. You pull the chair out and sit, briefly, and find that your hands go to a particular place on the desk without you choosing it. Your right wrist is in a small smooth groove where another wrist rested for many hours over many years.",
      "You get up. You roll the chair back to where it was, or close to.",
      "On the way up, you notice a photograph propped against the back of the monitor mount — a print, slightly curled at the edges. A man at this desk, headphones around his neck, looking at a screen the photographer cannot see. The angle of light in the photograph is the angle of light in the room right now. He does not know the photograph is being taken.",
      "You take it down. You put it in your inside pocket beside the lawyer's letter.",
    ],
    choices: [
      { label: "Step back.", next: 'dining_room', effects: { item: 'photo_d', sting: 'foreign', note: "A photograph at the desk. Of him. Of me." } },
    ],
  },

  dining_exit: {
    label: 'Dining Room',
    text: ["You leave."],
    choices: (s) => {
      if (s.act === 1) return [
        { label: "Go up the stairs.", next: 'upstairs_hall' },
        { label: "Back to the kitchen.", next: 'kitchen' },
        { label: "Back to the front hall.", next: 'front_hall_quiet' },
      ];
      return [
        { label: "Front hall.", next: 'front_hall' },
        { label: "Kitchen.", next: 'kitchen' },
        { label: "Upstairs.", next: 'upstairs_hall' },
      ];
    },
  },

  upstairs_hall: {
    label: 'Upstairs Hall',
    room: 'upstairs_hall',
    text: (s) => {
      if (s.act === 1) return [
        "The stairs creak in the middle. The third one from the top creaks most. You think, without choosing to: <em>step around it.</em>",
        "The upstairs hall is shorter than the downstairs one. Two doors on the left, one on the right, one at the end. The carpet runner up here is in better shape than the one below.",
        "There is a hair tie around the doorknob of the room at the end. Small, black, slightly stretched. Not new.",
      ];
      if (dominantInhabitant() === 'lena') return [
        "The hair tie on the doorknob at the end is one of several. Each doorknob in the hall has one. None of them are new, exactly, and none of them are very old.",
        "You step around the third stair from the top without thinking. There is a sound from one of the rooms — the muffled music of headphones worn by someone who does not want to be heard.",
      ];
      if (dominantInhabitant() === 'walter') return [
        "The runner up here has been brushed in one direction. The pile lies flat, and looking down the hall you can see the line of someone's most recent walk.",
        "The hair tie on the end doorknob is gone.",
      ];
      return [
        "The hall is the same. The hair tie is on a different door.",
      ];
    },
    choices: (s) => {
      if (s.act === 1) return [
        { label: "Try the first door on the left.", next: 'primary_bedroom' },
        { label: "Try the second door on the left.", next: 'second_bedroom' },
        { label: "Try the door on the right.", next: 'bathroom' },
        { label: "Try the door at the end.", next: 'attic_door_locked' },
        { label: "Go back down.", next: 'front_hall_quiet' },
      ];
      const opts = [
        { label: "First door on the left (primary bedroom).", next: 'primary_bedroom' },
        { label: "Second door on the left (small bedroom).", next: 'second_bedroom' },
        { label: "Door on the right (bathroom).", next: 'bathroom' },
        { label: "Door at the end.", next: (st) => st.flags.attic_open ? 'attic' : 'attic_door_locked' },
        { label: "Go back down.", next: 'front_hall' },
      ];
      if (!hasItem('hair_tie')) {
        opts.splice(4, 0, { label: "Take the hair tie from the end doorknob.", next: 'hair_tie_examine', effects: { affinity: { lena: 1 } } });
      }
      return opts;
    },
  },

  hair_tie_examine: {
    label: 'Upstairs Hall',
    text: [
      "You slip the hair tie off the doorknob. It comes away easily — looser than you expected. As it slides over the knob, something inside it catches and falls into your palm: a small brass key, older than any other key in the house. The hair tie had been wound around it tightly enough that no one looking would have seen.",
      "The key is warm. You don't know what door it fits, but you do, in the way of these things.",
      "You close your hand around it. The hair tie you slide onto your wrist without thinking, as if it had always lived there.",
    ],
    choices: [
      { label: "Step back into the hall.", next: 'upstairs_hall', effects: { item: ['hair_tie', 'attic_key'], affinity: { lena: 1 }, sting: 'revelation', note: "There was a key inside the hair tie. I knew it was there." } },
    ],
  },

  attic_door_locked: {
    label: 'Upstairs Hall',
    text: (s) => {
      if (hasItem('attic_key')) return [
        "You stand in front of the door at the end of the hall. The small brass key from the hair tie is in your hand, and your hand knows the door before your mind does. The key fits. The lock turns without resistance.",
        "There is a draft from above as the door opens — a stir of dry air, attic air, the air of a room that has not been entered in some time.",
      ];
      return [
        "The door is locked. The keyhole is older than any of the keys you have, and shaped for something smaller. The hair tie on the knob is the same hair tie you have seen on it every time you have stood here.",
        "You step back.",
      ];
    },
    choices: (s) => {
      if (hasItem('attic_key')) return [
        { label: "Go up the attic stairs.", next: 'attic', effects: { sting: 'revelation' } },
        { label: "Step back into the hall.", next: 'upstairs_hall' },
      ];
      return [
        { label: "Back to the hall.", next: 'upstairs_hall' },
      ];
    },
  },

  primary_bedroom: {
    label: 'Primary Bedroom',
    room: 'primary_bedroom',
    text: (s) => {
      if (s.act === 1) return [
        "Large room. Bed against the far wall, made, neatly. Dresser. Mirror over the dresser, slightly tilted. The curtains are pulled.",
        "On the bedside table there is a glass of water that is two-thirds full. The water is clear. You cannot tell if it has been here a day or a decade.",
        "There is a book on the bed, face-down, open to a page partway through. It does not seem to have been moved in some time. You don't move it now.",
      ];
      if (dominantInhabitant() === 'daniel') return [
        "The bed is no longer made. There is the indentation of a body in it, on one side only. The covers have been turned back as if someone got up briefly and meant to come back.",
        "The book is closed now, and on the bedside table beside the glass. There is dust on the cover but not on the spine.",
      ];
      return [
        "The book on the bed has been moved. It is open to a different page now. You do not check what it says.",
      ];
    },
    choices: (s) => {
      if (s.act === 1) return [
        { label: "Look at the book without moving it.", next: 'book_glance', effects: { path: -1 } },
        { label: "Open the curtains.", next: 'curtains' },
        { label: "Step back into the hall.", next: 'upstairs_hall' },
      ];
      const opts = [
        { label: "Lie down on the bed.", next: 'bed_lie', effects: { affinity: { daniel: 2 }, path: 1, sting: 'foreign' } },
      ];
      if (!hasItem('papers')) {
        opts.push({ label: "Try the bottom drawer of the dresser.", next: hasItem('hairclip') ? 'dresser_open' : 'dresser_locked' });
      }
      opts.push({ label: "Step back into the hall.", next: 'upstairs_hall' });
      return opts;
    },
  },

  dresser_locked: {
    label: 'Primary Bedroom',
    text: [
      "You try the bottom drawer of the dresser. It is locked. The keyhole is small, the kind that takes more than a key — a hairpin, a paperclip, anything thin and patient. You don't have anything that fits.",
      "You stand up. The lock is the kind that gives way to the right tool, and to nothing else.",
    ],
    choices: [
      { label: "Step back.", next: 'primary_bedroom', effects: { note: "The bottom dresser drawer is locked. Small keyhole. Needs something thin." } },
    ],
  },

  dresser_open: {
    label: 'Primary Bedroom',
    text: [
      "You take the yellow hairclip from your pocket. You bend it open. You bend it again at the angle that feels right. You feel for the wards in the lock. You have never done this before. Your hands have.",
      "The lock turns after a moment of resistance, smoothly, as if it has been opened recently.",
      "Inside the drawer there is a manila envelope and nothing else. The envelope is unsealed, the flap merely tucked. You take it out and weigh it in your hand. It is heavier than a single sheet, lighter than a story.",
    ],
    choices: [
      { label: "Open the envelope.", next: 'papers_examine', effects: { sting: 'revelation' } },
    ],
  },

  papers_examine: {
    label: 'Primary Bedroom',
    text: [
      "Three pieces of paper.",
      "The first is a copy of a birth certificate. The name on it is your name — almost. One letter in the middle has been replaced with another. The date of birth is yours, with the day and month transposed. The hospital is one you have heard of, but did not know was the one. The signature at the bottom is in faded green ink, in a hand you recognize from the lawyer's letter you have not yet finished reading.",
      "The second paper is a death certificate. Same name as the first. Same near-yours date of birth. Date of death: forty years ago, in this house. Cause of death has been left blank, as it sometimes is when no one was certain.",
      "The third paper is a property transfer. The transferor's name is the name from the first two certificates. The transferee's name is your own — correctly spelled this time, your current address, today's date. The transferor's signature is in the same faded green ink.",
      "You put the papers back in the envelope. You close the drawer. You stand in the room for a long time, holding the hairclip you have not put down, and you try to think of what this means in the order the lawyer would have explained it, and the order does not hold.",
    ],
    choices: [
      { label: "Leave the room.", next: 'upstairs_hall', effects: { item: 'papers', flag: 'read_papers', affinity: { walter: 1, marta: 1, lena: 1, daniel: 1 }, note: "The previous occupant's papers. The name is almost mine. The date of birth is mine, transposed. They died here forty years ago. They left the house to me today.", foreign: true } },
    ],
  },

  book_glance: {
    label: 'Primary Bedroom',
    text: [
      "You lean over without touching it. The page is not from any chapter you have read, though the writer's name on the running head is one you have read before. The sentence at the bottom of the visible page ends mid-clause, and continues on a page you would have to turn the book over to see.",
      "You don't turn it.",
    ],
    choices: [
      { label: "Step back.", next: 'primary_bedroom', effects: { note: "Book on the bed. Open mid-sentence. I haven't read this novel." } },
    ],
  },

  curtains: {
    label: 'Primary Bedroom',
    text: [
      "The light surprises you. It is later than you thought. You can see the back garden from here, overgrown to the height of a young tree, and the slope behind it going up to the dark line of the woods.",
      "From this window the garden looks like a place you walked in, once, with someone whose hand was smaller than yours.",
    ],
    choices: [
      { label: "Close the curtains again.", next: 'primary_bedroom', effects: { path: 1, note: "The garden from the upstairs window looks like a place I have walked in." } },
    ],
  },

  bed_lie: {
    label: 'Primary Bedroom',
    text: [
      "You don't mean to. You sit on the edge of the bed, and then you lie down for a moment, just to test the shape of it. The mattress remembers another body's weight better than yours. You feel yourself settling into a configuration that is not yours.",
      "You get up almost immediately. You make the bed again. You do it the way you found it, which is not the way you would have done it.",
    ],
    choices: [
      { label: "Step back into the hall.", next: 'upstairs_hall', effects: { foreign: true, note: "He kept the curtains drawn after October. The light hurt." } },
    ],
  },

  second_bedroom: {
    label: 'Small Bedroom',
    room: 'second_bedroom',
    text: (s) => {
      if (s.act === 1) return [
        "Small room. A single bed, neatly made, with a quilt of a pattern you almost recognize. A child-sized desk under the window. A closet door, slightly ajar.",
        "The wallpaper is faded but you can tell what it was — a pattern of small blue flowers, the kind a parent picks for a girl's room when the girl is still small enough to be picked for.",
        "There is no dust on the desk. There is dust on everything else.",
      ];
      if (dominantInhabitant() === 'lena') return [
        "The closet door is more open than it was. You can see, on the inside of it, pencil writing — words in lines, the spacing of song lyrics. You do not lean in to read them yet.",
        "On the desk there is a hair tie, the same kind as the ones on the doorknobs. It was not here before.",
      ];
      if (dominantInhabitant() === 'walter') return [
        "The bed has been freshly made. The quilt has been folded down at the corner with the care of someone preparing the room for a guest who will not arrive.",
        "There is a small porcelain dish on the desk, holding a single hairpin. The dish is clean.",
      ];
      return [
        "The room is largely the same. The closet door is at a slightly different angle.",
      ];
    },
    choices: (s) => {
      if (s.act === 1) return [
        { label: "Look in the closet.", next: 'closet_lyrics', effects: { path: -1, affinity: { lena: 1 } } },
        { label: "Sit at the child's desk.", next: 'child_desk', effects: { path: 1, affinity: { lena: 1 } } },
        { label: "Step back into the hall.", next: 'upstairs_hall' },
      ];
      if (dominantInhabitant() === 'lena') return [
        { label: "Lean in and read the closet door.", next: 'closet_read', effects: { affinity: { lena: 2 }, path: 1, sting: 'foreign' } },
        { label: "Step back into the hall.", next: 'upstairs_hall' },
      ];
      return [
        { label: "Step back into the hall.", next: 'upstairs_hall' },
      ];
    },
  },

  closet_lyrics: {
    label: 'Small Bedroom',
    text: [
      "Inside the closet there is the smell of cedar from a block long since used up. On the back wall there are pencil lines marking the height of a girl at different ages. The last line, the highest, has no name and no date.",
      "On the inside of the door there is writing in pencil — small, careful lines, set apart from each other like song lyrics. You don't lean in to read them. Something in you doesn't want to.",
    ],
    choices: [
      { label: "Step back.", next: 'second_bedroom', effects: { note: "Pencil writing inside the closet door. I didn't read it." } },
    ],
  },

  closet_read: {
    label: 'Small Bedroom',
    text: [
      "You lean in. The writing is from at least two different ages, in the same hand getting older. It is song lyrics, mostly, with a few lines of something else mixed in.",
      "Among them, in pencil that looks fresher than the rest, in handwriting that is recognizably the same and recognizably your own:",
      "<em class=\"drift\">if I stay very still he will go past the door.</em>",
    ],
    choices: [
      { label: "Step back.", next: 'second_bedroom', effects: { foreign: true, affinity: { lena: 2 }, note: "if I stay very still he will go past the door." } },
    ],
  },

  child_desk: {
    label: 'Small Bedroom',
    text: [
      "You sit. Your knees don't fit under it. You rest your hands on the surface anyway. There is a small groove in the wood at the front edge where a child sat for many hours and pressed her wrists.",
      "You stand up.",
    ],
    choices: [
      { label: "Step back.", next: 'second_bedroom' },
    ],
  },

  bathroom: {
    label: 'Bathroom',
    room: 'bathroom',
    text: (s) => {
      if (s.act === 1) return [
        "The bathroom is gray. The tile is gray. The grout is darker gray. The towels on the rack are gray-white from many washings.",
        "Where a chip has come out of the wall by the sink, a much older yellow shows through. The yellow looks more recent than the gray, somehow.",
        "The mirror over the sink has a small crack running down from the top left corner. You don't stand directly in front of it.",
      ];
      if (dominantInhabitant() === 'marta') return [
        "The bathroom is yellow. The tile is the same, but the walls and the trim and the door, all yellow, fresh-looking, recently painted. The towels on the rack are yellow.",
        "The mirror does not have a crack. Or — the crack is in a different place now, lower, running from the bottom right.",
      ];
      return [
        "The bathroom is the same. You think.",
      ];
    },
    choices: (s) => {
      if (s.act === 1) return [
        { label: "Look in the mirror.", next: 'mirror_look', effects: { path: -1, sting: 'mirror' } },
        { label: "Step out.", next: 'upstairs_hall' },
      ];
      const opts = [];
      if (!hasItem('photo_m')) {
        opts.push({ label: "Lift the chip of paint by the sink.", next: 'bathroom_paint', effects: { path: 1, affinity: { marta: 1 } } });
      }
      opts.push({ label: "Step out.", next: 'upstairs_hall' });
      return opts;
    },
  },

  bathroom_paint: {
    label: 'Bathroom',
    text: [
      "You crouch beside the sink. The chip has been here a long time. With your fingernail you can lift a corner of the gray, and it comes away as a flake. Underneath, the yellow — the same yellow that has been showing through, the yellow this room used to be.",
      "Behind the flake, where the plaster has pulled slightly from the wall, you can see something tucked. A small piece of card, mostly hidden. You work it out gently.",
      "It is a photograph. A woman at a kitchen window, cigarette in hand, laughing at whoever is holding the camera. The yellow of the wall behind her is the yellow under your finger now. She does not look like anyone you know. You feel as though you owe her something.",
      "You press the gray flake back into place. It does not quite go where it was.",
    ],
    choices: [
      { label: "Step out of the bathroom.", next: 'upstairs_hall', effects: { item: 'photo_m', note: "A photograph behind the bathroom paint. A woman at a kitchen window." } },
    ],
  },

  mirror_look: {
    label: 'Bathroom',
    text: [
      "You step in front of it. You are there. The light is bad. Your reflection takes a half-second to turn its head when you turn yours — or does not. You cannot tell whether you saw it, or expected to see it, and so saw it.",
      "You step back.",
    ],
    choices: [
      { label: "Leave the bathroom.", next: 'upstairs_hall', effects: { note: "The mirror is slow. Or I am." } },
    ],
  },

  basement: {
    label: 'Basement',
    room: 'basement',
    text: (s) => {
      if (s.act === 1) return [
        "The basement stairs are bare wood. The light at the bottom is a single bare bulb, pull-string. The air down here is cooler and smells of dust and something like pencil shavings.",
        "There is a workbench along one wall. A vise. Tools hung above it on a pegboard, each in its outlined silhouette. None missing.",
        "Behind the boiler there is a gap between the boiler and the wall. From here it looks just wide enough for a child to fit.",
      ];
      if (dominantInhabitant() === 'walter') return [
        "The workbench has been used recently. There are fresh pencil shavings on it. The pegboard is full. No tool is missing.",
        "There is a small wooden box on the bench you did not see before. The box has a hand-written label: <em>Pieces that did not fit.</em>",
      ];
      if (dominantInhabitant() === 'lena') return [
        "The light is off. You pull the string. It comes on slowly, as old bulbs do.",
        "Behind the boiler, the gap. From the floor in front of it you can see something pale just inside it — a piece of paper, perhaps, or a piece of cloth.",
      ];
      return [
        "The basement is the same. Something has been moved on the workbench. You cannot tell what.",
      ];
    },
    choices: (s) => {
      if (s.act === 1) return [
        { label: "Look at the workbench.", next: 'workbench', effects: { affinity: { walter: 1 } } },
        { label: "Look behind the boiler.", next: 'boiler_gap', effects: { affinity: { lena: 1 }, path: -1 } },
        { label: "Go back up.", next: 'front_hall' },
      ];
      if (dominantInhabitant() === 'walter') return [
        { label: "Open the box.", next: 'box_open', effects: { affinity: { walter: 2 }, path: 1, sting: 'foreign' } },
        { label: "Go back up.", next: 'front_hall' },
      ];
      if (dominantInhabitant() === 'lena') return [
        { label: "Reach into the gap behind the boiler.", next: 'gap_reach', effects: { affinity: { lena: 2 }, path: 1, sting: 'foreign' } },
        { label: "Go back up.", next: 'front_hall' },
      ];
      return [
        { label: "Go back up.", next: 'front_hall' },
      ];
    },
  },

  workbench: {
    label: 'Basement',
    text: [
      "The bench is clean. Someone wiped it down within the last year or so. The pegboard outlines are not even slightly misaligned with the tools they hold.",
      "On a small shelf above the bench there is a single tin of butterscotch sweets, identical to the one in the front hall.",
    ],
    choices: [
      { label: "Step back.", next: 'basement', effects: { note: "Another tin of butterscotch in the basement. Same kind." } },
    ],
  },

  boiler_gap: {
    label: 'Basement',
    text: [
      "You crouch down. The gap is narrower than it looked. A child could fit. A small child. You wouldn't.",
      "The dust on the floor near the gap has been disturbed. It is the only floor in the basement where the dust has been disturbed.",
    ],
    choices: [
      { label: "Step back.", next: 'basement', effects: { note: "Gap behind the boiler. Someone has been there. Recently." } },
    ],
  },

  box_open: {
    label: 'Basement',
    text: [
      "Inside the box there are small things. A washer. A button. A child's tooth. A bent house key. A piece of foil from a butterscotch sweet, smoothed flat and folded once.",
      "Each item rests in its own small white envelope. Each envelope is labelled in a careful block hand. The labels do not describe the items inside them. They describe rooms.",
    ],
    choices: [
      { label: "Close the box.", next: 'basement', effects: { foreign: true, note: "Each piece in the box is labelled with a room I have not yet been to." } },
    ],
  },

  gap_reach: {
    label: 'Basement',
    text: [
      "You don't get your arm in very far. Your hand finds something soft — fabric — and tugs it gently out. It is a child's sock, balled up, the elastic gone. There is something inside it.",
      "You unfold it. A folded piece of notebook paper, with three lines of pencil writing in a hand you know without being told whose it is — yours, at fourteen.",
    ],
    choices: [
      { label: "Step back without reading it.", next: 'basement', effects: { path: -1, note: "A note from me, at fourteen, in a house I have never lived in." } },
      { label: "Read it.", next: 'gap_read', effects: { path: 2, affinity: { lena: 3 }, foreign: true } },
    ],
  },

  gap_read: {
    label: 'Basement',
    text: [
      "<em class=\"drift\">If you find this, you are still here. I am sorry. I tried to leave.</em>",
      "You fold it back up and put it back in the sock and put the sock back in the gap. You arrange the dust on the floor with your shoe to look the way it did.",
    ],
    choices: (s) => {
      const opts = [];
      if (!hasItem('photo_l')) {
        opts.push({ label: "Reach in again, further this time.", next: 'gap_deep', effects: { path: 1, affinity: { lena: 1 } } });
      }
      opts.push({ label: "Go back up.", next: 'front_hall', effects: { note: "If you find this, you are still here. I am sorry. I tried to leave." } });
      return opts;
    },
  },

  gap_deep: {
    label: 'Basement',
    text: [
      "You sit a moment. Then you reach in again. Your shoulder presses against the boiler casing. Your fingers find a corner of something else, deeper than the sock — paper, behind a brick that has come loose from the wall.",
      "You ease the brick out, slowly, because you do not want it to fall and make a sound that the rest of the house will hear. There is a small recess behind it. Inside the recess, a school photograph — a girl perhaps thirteen, in the unsmiling pose of someone who has been told to smile. The corner has been torn off, the corner that would have had her name.",
      "You hold the photograph for a long time. The girl in it does not look at you. She looks past you, at the photographer, with the steady wary expression of someone who has been asked too many questions today.",
      "You put the brick back. You arrange the dust again.",
    ],
    choices: [
      { label: "Stand up.", next: 'front_hall', effects: { item: 'photo_l', note: "There was a recess behind a brick in the basement. A photograph in it." } },
    ],
  },

  /* ---- ACT BREAK -------------------------------------- */

  act_break: {
    label: 'Evening',
    text: [
      "You sit down in the living room when you have finished the walk-through. The light has gone. You have not turned on a lamp.",
      "You have not decided what to do with the house. You have not decided whether to stay tonight or drive into town and find a motel. You did not bring a bag.",
      "The decision is made for you slowly, by sitting still in it. The room cools. Outside a car passes on the road and does not stop. You sit a little longer.",
      "When you stand up, you walk back through the house, and the rooms are not exactly the same as they were an hour ago.",
    ],
    choices: [
      { label: "Walk back through the house.", next: 'front_hall', effects: { act: 2, note: "I have decided to stay the night. I think." } },
    ],
  },

  /* ---- ACT II ENTRY HOOK ----------------------------- */
  // Reaching Act II goes via the room exits which auto-route based on s.act.
  // The first walk-through of Act I terminates via the basement → act_break flow,
  // chained from the upstairs visit.

  /* The Act I sequence is loosely linear (the protagonist is doing a first
     walkthrough), so we route ground floor → upstairs → back down → basement →
     act break. Once act = 2, the same room scenes serve up shifted variants. */

  living_room_continue: {
    label: 'Living Room',
    text: ["You return to the hall."],
    choices: [
      { label: "Continue.", next: 'kitchen' },
    ],
  },

  /* ---- ATTIC (Act III) -------------------------------- */

  attic: {
    label: 'Attic',
    room: 'attic',
    text: (s) => {
      const dom = dominantInhabitant();
      const base = [
        "The attic stairs come down out of the ceiling in pieces, smoothly, as if someone has used them recently. You go up.",
        "The attic is one long low room under the roof, and you have to stoop. It smells of dry wood. The single small window at the far end shows a sky that is either the end of one day or the beginning of another.",
      ];
      if (dom === 'walter') return base.concat([
        "The attic is laid out like a room of his. A folded chair. A tin of butterscotch. A notebook on the floor by the chair, the page open, a pencil resting in the fold. The page is dated today, and the page is waiting for something.",
      ]);
      if (dom === 'marta') return base.concat([
        "Someone has been unpacking up here. A box has been pulled open and its contents — paperbacks, a yellow scarf, a child's drawing — laid out on the boards in the careful way of someone deciding what to keep.",
        "The scarf is in your size.",
      ]);
      if (dom === 'lena') return base.concat([
        "There is a hiding place behind the chimney brick. You see it before you see the chimney. A gap, just wide enough.",
      ]);
      if (dom === 'daniel') return base.concat([
        "There is a desk up here you have never seen before. The chair is pulled out as if someone just stood up. The papers on the desk are recent.",
        "The lamp is on. The angle of light is one you recognize.",
      ]);
      return base.concat([
        "The attic is empty. It is the only room in the house that has ever been empty.",
      ]);
    },
    choices: (s) => {
      const dom = dominantInhabitant();
      const opts = [];

      // The photographs override path: if you have all four, the offer is here.
      if (hasAllPhotos()) {
        opts.push({ label: "Take out the four photographs.", next: 'photo_assembly', effects: { sting: 'revelation' } });
      }

      if (dom === 'walter') {
        opts.push({ label: "Sit down in the chair and pick up the pencil.", next: 'ending_walter' });
      } else if (dom === 'marta') {
        opts.push({ label: "Begin packing the box back up.", next: 'ending_marta' });
      } else if (dom === 'lena') {
        opts.push({ label: "Crawl into the hiding place.", next: 'ending_lena' });
      } else if (dom === 'daniel') {
        opts.push({ label: "Sit down at the desk.", next: 'ending_daniel' });
      }

      opts.push({ label: "Go back down.", next: dom ? 'leave_intent' : 'ending_fifth', effects: { flag: 'attempted_leave' } });
      return opts;
    },
  },

  photo_assembly: {
    label: 'Attic',
    text: [
      "You take the four photographs from your inside pocket and lay them on the bare floor of the attic, in the order in which you found them. Walter and his sister, before. Marta at her kitchen window, smoking, laughing at someone. Lena, told to smile and not smiling. Daniel at his desk in October light, photographed without his knowledge.",
      "You arrange them. You rearrange them. None of the orders feel right. None of them feel wrong.",
      "Looking at them in sequence, you notice that the four people are looking at you with the same expression. Or that you are looking at four photographs of yourself, at different ages, in different rooms, doing different things. You cannot decide which is true, and after a while you stop trying.",
      "The attic is no longer empty. It has these four photographs in it, and you, and a particular slant of light that is the light of every room in this house at the same time of day.",
    ],
    choices: [
      { label: "Stay where you are.", next: 'ending_true' },
    ],
  },

  leave_intent: {
    label: 'Upstairs Hall',
    text: (s) => {
      const dom = dominantInhabitant();
      if (!dom) return [
        "You go back down. The hall is the hall. The stairs are the stairs. You go to the front door. You open it.",
        "The outside is outside. Your car is where you left it. The road is the road.",
        "You stand in the doorway a long moment. You think — and the thinking is yours — that you do not have to go back in.",
      ];
      return [
        "You go back down. You mean to leave. You walk to the front door. You put your hand on the knob.",
        "You stand there a moment.",
      ];
    },
    choices: (s) => {
      const dom = dominantInhabitant();
      if (!dom) return [
        { label: "Walk to the car.", next: 'ending_fifth' },
      ];
      // Forced to commit: going back up triggers the ending tied to dom
      const dest = 'ending_' + dom;
      return [
        { label: "Open the door and leave.", next: 'ending_fifth' },
        { label: "Go back up the stairs.", next: dest },
      ];
    },
  },

  /* ---- ENDINGS ---------------------------------------- */

  ending_walter: {
    label: 'An Ending',
    ending: true,
    text: [
      "You sit. The chair is the right shape for you. The pencil is the right weight.",
      "You open the notebook to the empty page. The page wants a date and a name and an arrival time. You write the date. You write a name — not yours, exactly, but the one you have just decided to use here.",
      "The space for departure you leave empty. It feels correct to leave it empty.",
      "Downstairs, in the hall drawer, the visitor's book updates itself in the same hand.",
      "You begin labelling the drawers in the morning.",
    ],
  },

  ending_marta: {
    label: 'An Ending',
    ending: true,
    text: [
      "You pack the box back up neatly. You carry it downstairs and out to the car. You take only what fits.",
      "You drive into town in the morning and meet the lawyer and sign the papers to put the house on the market. The light on the way out feels different than the light on the way in. You are not certain whose relief you are feeling.",
      "You sell. You move south. You live a long time.",
      "Sometimes you wake at three in the morning and think about a yellow bathroom you have never seen, and a radio dial set between two stations, and the smell of a particular brand of cigarette that you have never smoked.",
      "These things do not trouble you. They are someone else's, and you are grateful to be carrying them lightly.",
    ],
  },

  ending_lena: {
    label: 'An Ending',
    ending: true,
    text: [
      "You crawl into the gap behind the chimney brick. You fit, just.",
      "It is darker than you expected, and warmer. Your shoulders find the shape of the place. Your knees come up under your chin without being asked.",
      "You can hear, from a long way off, footsteps on the stair, and the careful way someone comes up to this room when they are looking for you.",
      "You stay very still. He goes past the door.",
      "You stay a little longer, to be sure.",
    ],
  },

  ending_daniel: {
    label: 'An Ending',
    ending: true,
    text: [
      "You sit down at the desk. The chair takes your weight in the shape it has been waiting for.",
      "The papers in front of you are a project that has been going for a long time, and you find that you know what comes next. You pick up the pen.",
      "You work into the evening. You work into the night. You forget to eat. You forget to call the friend who has been meaning to check on you.",
      "Eventually you do not get up from the chair.",
      "No one notices for some time.",
    ],
  },

  ending_fifth: {
    label: 'An Ending',
    ending: true,
    text: [
      "You walk to the front door. You open it. You step out onto the porch and pull the door closed behind you.",
      "The car is where you left it. The road is the road. You get in. You sit a moment with the key in your hand.",
      "On the passenger seat there is a letter you do not remember leaving there. The envelope is addressed to a name that is not yours, in handwriting that is.",
      "Inside, in your own handwriting: <em>the house was left to you in full. There are no other beneficiaries. It is suggested that you visit.</em>",
      "You put the key in the ignition. You sit a little longer.",
      "The house behind you is empty in a way it has not been before.",
    ],
  },

  ending_true: {
    label: 'An Ending',
    ending: true,
    text: [
      "You sit down on the attic boards with the four photographs in front of you and find that you do not get up.",
      "The house is quiet around you. It is not waiting. It is not watching. It is present, the way a body is present, the way a memory is present once it has settled.",
      "Downstairs, the visitor's notebook on the hall table updates itself in the same careful hand. Today's date. A name that is not quite yours and is. Arrival time recorded. The space for departure has been left empty.",
      "In a town to the south, an old woman who was once Marta wakes from a dream of yellow paint and feels, for a moment, no fear of it. In a school photograph kept in a desk drawer in a city she never returned to, a girl who was once Lena is smiling, very faintly, for the first time. The cushion in the living room remembers two shapes now, evenly weighted. The notebook in the kitchen drawer has a new entry, in the same careful block hand, dated tomorrow.",
      "You stay. You are also gone. There is no difference here.",
    ],
  },

  /* ---- ROUTING AID: at end of Act I, send the player to act_break.
     We hook this from the basement go-back-up in Act I, and from any
     "all rooms visited" check could be added; for now the basement is
     the natural deepest point.  ---- */

};

/* ---------- Scene routing tweaks for Act I → Act II ----------
   We override two scenes' choice destinations so that returning from the
   basement at the end of Act I triggers act_break. */

const _origBasementChoices = scenes.basement.choices;
scenes.basement.choices = function(s) {
  const base = _origBasementChoices(s);
  if (s.act === 1 && (s.visited.basement || 0) >= 1) {
    return base.map(c => {
      if (c.label === 'Go back up.') {
        return Object.assign({}, c, { next: 'act_break' });
      }
      return c;
    });
  }
  return base;
};

/* Once Act II has gone long enough — defined as 8+ Act-II room visits OR
   a dominant inhabitant with affinity ≥ 5 — the upstairs hall offers the
   attic. We unlock it via the 'attic_door_locked' scene above by flipping
   state.flags.attic_open at that threshold. */

const _origUpstairsChoices = scenes.upstairs_hall.choices;
scenes.upstairs_hall.choices = function(s) {
  // Compute total Act II visits
  const total = Object.values(s.visited).reduce((a,b)=>a+b, 0);
  const dom = dominantInhabitant();
  const domVal = dom ? s.affinity[dom] : 0;
  if (s.act === 2 && (total >= 14 || domVal >= 5)) {
    s.act = 3;
    s.flags.attic_open = true;
  }
  return _origUpstairsChoices(s);
};
