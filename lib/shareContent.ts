// All the words on the "What to share" page (/share) live here, so they can be
// rewritten without touching any layout code. Change any text in quotes and
// the page updates. Keep the same shape (same keys, same number of steps).
//
// Bible verses are from the World English Bible (public domain), copied from
// ebible.org, word for word. The WEB license says changed text must not be
// called the World English Bible, so never edit words inside a verse. To
// shorten one, quote a complete sentence or mark skipped words with "...".
// The page shows each verse exactly as written here, without adding quote marks.

export type Verse = { text: string; ref: string };

export type CircleStep = {
  heading: string;
  body: string[]; // one entry per paragraph
  verse?: Verse;
  // Read aloud by screen readers in place of the drawing for this step.
  diagramDescription: string;
};

export const PAGE = {
  title: "What to share",
  metaDescription: "A simple, hand-drawn way to talk about Jesus with someone in your oikos.",
  lead: "You don't need a script or a seminary degree. You need a pen, something to draw on, and one honest conversation.",
};

export const INTRO = {
  paragraphs: [
    "Talking about Jesus can feel like a big, scary thing. What if I say it wrong? What if they ask something I can't answer? Here's the good news: you don't have to be impressive. You just have to be honest.",
    "Below is one simple way to do it with three circles on a napkin (or a receipt, or the back of your hand). It takes about five minutes, and it works best as a conversation, not a speech.",
  ],
  listenFirst: {
    heading: "Listen first",
    text: "In BLESS, Share comes last for a reason. Begin with prayer, Listen, Eat, and Serve come first. People can tell when they're a project. They can also tell when they're loved. Earn the right to be heard by hearing them.",
  },
};

export const CIRCLES = {
  heading: "Three circles on a napkin",
  intro: "Draw as you talk. Each step adds a little more to the picture. You don't have to say it like this. Use your own words.",
  steps: [
    {
      heading: "Start with what God made",
      body: [
        "Draw a circle and write “made good” inside. In the beginning, God made a world that worked, and He made us to know Him, love each other, and enjoy it all with Him.",
        "That's life the way it was meant to be.",
      ],
      verse: {
        text: "God saw everything that he had made, and, behold, it was very good.",
        ref: "Genesis 1:31",
      },
      diagramDescription: "One hand-drawn circle labeled “made good.”",
    },
    {
      heading: "Then something broke",
      body: [
        "Draw an arrow to a second circle and scribble a little mess inside. Ask: does the world look like that first circle to you? Most people already know something is off.",
        "We went our own way, and it bent everything: our hearts, our relationships, the world. Add a few little arrows that loop out and come right back. Those are the quick fixes we reach for, like money, success, romance, or staying busy. They help for a while. They never fill the hole.",
      ],
      verse: {
        text: "for all have sinned, and fall short of the glory of God;",
        ref: "Romans 3:23",
      },
      diagramDescription:
        "The first circle, labeled “made good,” with an arrow marked “our own way” leading to a second circle labeled “broken” with a scribble inside. Small arrows loop out of the broken circle and curve right back into it, labeled “quick fixes.”",
    },
    {
      heading: "Jesus came for us",
      body: [
        "Draw a third circle below the other two and put a cross in it. God didn't leave us stuck in the mess.",
        "Jesus came. He lived the life we couldn't, died in our place, and rose from the dead three days later. He is God's way out.",
      ],
      verse: {
        text: "But God commends his own love toward us, in that while we were yet sinners, Christ died for us.",
        ref: "Romans 5:8",
      },
      diagramDescription:
        "The “made good” and “broken” circles across the top, and a third circle below them with a cross inside, labeled “Jesus.”",
    },
    {
      heading: "Turn and trust",
      body: [
        "Draw an arrow from the broken circle down to Jesus. This is the turn: we stop running our own way, and we put our trust in Him.",
        "It isn't cleaning yourself up first. It's believing that Jesus did what you never could.",
      ],
      verse: {
        text: "that if you will confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved.",
        ref: "Romans 10:9",
      },
      diagramDescription:
        "The three circles, now with an arrow from the “broken” circle down to the “Jesus” circle, labeled “turn and trust.”",
    },
    {
      heading: "Made new",
      body: [
        "Now draw an arrow from Jesus back up to the first circle. Jesus doesn't only rescue us from something. He brings us back into the life God meant for us all along.",
        "Not perfect overnight. But forgiven, new, and home.",
      ],
      verse: {
        text: "For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.",
        ref: "Romans 6:23",
      },
      diagramDescription:
        "The three circles with two arrows: “turn and trust” from broken down to Jesus, and “made new” from Jesus back up to the “made good” circle.",
    },
    {
      heading: "Sent back out",
      body: [
        "Last, draw a few short arrows from the first circle out to some little squares and circles. People who've been made new don't keep it to themselves.",
        "We go back to the people already around us. (Sound familiar? That's your oikos map.)",
      ],
      verse: {
        text: "Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all things that I commanded you. Behold, I am with you always, even to the end of the age.\u201d Amen.",
        ref: "Matthew 28:19–20",
      },
      diagramDescription:
        "The full picture: the three circles and their arrows, plus short arrows going out from the “made good” circle to three small squares and circles, labeled “your people.”",
    },
    {
      heading: "Ask the question",
      body: [
        "Hand them the pen and ask, “Where do you see yourself in this picture?” Then stop talking and really listen.",
        "If they're ready to turn and trust Jesus, you can pray with them right there. If they're not, you've still had a real conversation about what matters most. That counts.",
      ],
      diagramDescription:
        "The full picture with a question mark beside each of the three circles, and the words “Where are you?” underneath.",
    },
  ] as CircleStep[],
};

// Short words written inside the drawing. Keep them tiny so they fit.
export const DIAGRAM_LABELS = {
  made: "made good",
  ownWay: "our own way",
  broken: "broken",
  quickFixes: "quick fixes",
  jesus: "Jesus",
  turn: "turn & trust",
  madeNew: "made new",
  people: "your people",
  question: "Where are you?",
};

export const STORY = {
  heading: "Your story",
  intro: "Nobody can argue with what happened to you. Jot down three short parts:",
  parts: [
    {
      label: "Before",
      prompt: "What was life like before you followed Jesus? What were you looking for? (If you met Him as a kid, think about who you'd be without Him.)",
    },
    {
      label: "How I met Jesus",
      prompt: "What happened? Who or what helped you turn and trust Him?",
    },
    {
      label: "Since",
      prompt: "What's different now? Be honest. Not perfect, just different.",
    },
  ],
  note: "Keep it to about a minute. Short and real beats long and polished, and it leaves room for their story too.",
};

export const PRACTICE = {
  heading: "Practice once",
  paragraphs: [
    "Before you try it for real, try it with a friend, your spouse, or your small group. Draw the circles and walk through them out loud.",
    "It will feel clunky the first time. That's fine. By the third time, it's yours.",
  ],
};

export const LET_GO = {
  heading: "Pray, then let go",
  paragraphs: [
    "You're not in charge of the result. God is. Your part is to love people and tell the truth kindly, and then trust Him with the rest.",
    "Every honest conversation is a seed, even the ones that seem to go nowhere.",
  ],
};

export const CREDIT = {
  heading: "Where this comes from",
  paragraphs: [
    "The three-circles way of sharing the gospel was popularized by pastor Jimmy Scroggins and is promoted by the North American Mission Board (NAMB). This page is our own plain-language take on it, written for this app.",
  ],
  learnMoreText: "Want to go deeper? Visit the North American Mission Board",
  learnMoreUrl: "https://www.namb.net",
};

export const TRANSLATION_NOTE = "Bible verses on this page are from the World English Bible (public domain).";

export const LINKS = {
  backToMap: "Back to my map",
  learn: "How an oikos map works",
};
