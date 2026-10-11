import { ALGO_LESSONS, stageLesson, narrateStep } from './lessons';

// The guided tour, written as plain async code: Blip says something, flies to
// a control, "clicks" it for the learner, then explains what just happened.
//
// Rule of the script: Blip never announces what a control is called. Before a
// demo he only says "click this button and see how it works", then the
// learner watches the result happen and he explains the *function*.
//
// `api` is supplied by TeachGuide.jsx:
//   say(text)        speak + caption (resolves when finished or skipped)
//   point(selector)  fly to an element and spotlight it (null = free float)
//   click(selector)  press an element for the learner (with a ripple)
//   wait(ms)         pause-aware sleep
//   until(fn, ms)    wait for a condition
//   has(selector)    is the element on screen?
//   page             hooks into VisualizerPage state

const T = (key) => `[data-teach="${key}"]`;

const cleanName = (name) => name.replace(/\s*\(.*?\)\s*/g, ' ').trim();

// Which steps Blip talks through. Sorting, searching, graphs and trees read
// best as a straight walk through the first few moves. DP tables repeat the
// same kind of cell again and again, so there we skip repeats after two.
function pickCommentarySteps(steps, category, max = 8) {
  const out = [];
  const seen = {};
  for (let i = 0; i < steps.length - 1 && out.length < max; i += 1) {
    if (category === 'dp') {
      const kind = (steps[i].description || '').replace(/[\d=(),<>]+/g, '').slice(0, 18);
      seen[kind] = (seen[kind] || 0) + 1;
      if (seen[kind] > 2) continue;
    }
    out.push(i);
  }
  return out;
}

export async function runTour(api) {
  const { say, point, click, wait, until, has, page } = api;

  page.begin();
  let ctx = page.get();
  const lesson = ALGO_LESSONS[ctx.algoKey];
  const name = cleanName(ctx.algo.name);

  /* ----------------------------- hello ----------------------------- */
  point(null);
  await say("Hi, I'm Blip! I'm going to show you how this visualizer works. Just sit back, listen, and watch.");

  /* ------------------------ choosing the topic ---------------------- */
  if (has(T('algo'))) {
    point(T('algo'));
    await say('First things first. This is where you decide what you want to learn. Sorting, searching, graphs, trees and dynamic programming are all in here. Pick any one, and the whole screen changes to match it.');
    await say(`Right now ${name} is selected, so that is what I will teach you today.`);
  }

  /* --------------------------- the idea ----------------------------- */
  if (has(T('complexity'))) {
    point(T('complexity'));
    await say(`Let me explain ${name} in simple words.`);
    if (lesson) await say(lesson.idea);
  } else if (lesson) {
    point(null);
    await say(lesson.idea);
  }

  /* ----------------------- the input controls ----------------------- */
  if (ctx.showArrayControls && has(T('new-array'))) {
    point(T('new-array'));
    await say('Click this button, and you will see how it works.');
    await click(T('new-array'));
    await wait(700);
    await say('See that? The numbers on the stage just changed. Every click gives you a brand new set to experiment with.');

    if (has(T('size'))) {
      point(T('size'));
      await say('Drag this left or right, and the amount of numbers grows or shrinks. Fewer numbers are easier to follow. More numbers show you how the algorithm copes with bigger jobs.');
    }
    if (has(T('custom'))) {
      point(T('custom'));
      await say('You can also type your own numbers in here, separated by commas. Then click the button beside the box, or just press enter, and the stage uses exactly your numbers.');
    }
  }

  if (ctx.isSearchAlgo) {
    page.prepare(); // puts a real target in the box so the demo can run
    await wait(400);
    if (has(T('target'))) {
      point(T('target'));
      await say('Type the number you want to find in here, and the algorithm will go hunting for it. I have already put one in for you, so you can see it work.');
    }
  }

  if (ctx.isFibonacci && has(T('fib-n'))) {
    point(T('fib-n'));
    await say('This box decides which Fibonacci number we calculate. Try anything from zero to twenty five.');
  }

  /* --------------------------- the stage ---------------------------- */
  ctx = page.get();
  if (has(T('stage'))) {
    point(T('stage'));
    for (const line of stageLesson(ctx.algoKey, ctx.category)) await say(line);
  }

  /* --------------------------- complexity --------------------------- */
  if (has(T('complexity'))) {
    point(T('complexity'));
    const a = ctx.algo;
    await say('On this side you will find the theory. Big O notation tells you how the amount of work grows when the input grows.');
    await say(`For ${name}, the best case is ${a.best}. The average case is ${a.average}. The worst case is ${a.worst}. And the extra memory it needs is ${a.space}.`);
    if (has(T('counters'))) {
      point(T('counters'));
      await say('These live counters count the real work being done, like comparisons and swaps. Watch them climb while the algorithm runs.');
    }
  }

  /* ------------------------ the playback controls ------------------- */
  if (has(T('next'))) {
    point(T('next'));
    await say('Now the fun part. Click this button, and you will understand how it functions.');
    await click(T('next'));
    await wait(700);
    await say('One click, one tiny move. That is how you can study every single decision the algorithm makes.');

    if (has(T('prev'))) {
      point(T('prev'));
      await say('And what about this one? Click it, and see.');
      await click(T('prev'));
      await wait(700);
      await say('One step back in time. Perfect when you want to rewatch a move you missed.');
    }
    if (has(T('step-count'))) {
      point(T('step-count'));
      await say('This counter tells you which step you are on, out of the total number of steps.');
    }
    if (has(T('speed'))) {
      point(T('speed'));
      await say('Drag this to make the animation faster or slower. Slow is great while you are learning.');
    }
    if (has(T('restart'))) {
      point(T('restart'));
      await say('Click this, and watch what happens.');
      await click(T('restart'));
      await wait(600);
      await say('Everything jumps back to the very beginning, ready for another run.');
    }
  }

  /* --------------------------- play it ------------------------------ */
  if (has(T('play'))) {
    point(T('play'));
    await say('Last one, and the best one. Click this button, and watch the stage.');
    await click(T('play'));
    point(T('stage'));
    await say('Everything moves on its own. You can pause at any time by clicking the same button again.');
    if (page.get().isPlaying) {
      point(T('play'));
      await click(T('play'));
      await wait(400);
    }
  }

  /* ------------------------ live commentary ------------------------- */
  ctx = page.get();
  if (ctx.steps.length > 1) {
    point(T('stage'));
    await say('Now let me slow things down, and talk you through the first few moves.');
    if (has(T('restart'))) {
      point(T('restart'));
      await click(T('restart'));
      await wait(400);
    }
    point(T('stage'));
    if (lesson) await say(`Here is what to look for. ${lesson.watch}`);

    const live = page.get().steps;
    const lastIdx = live.length - 1;
    for (const i of pickCommentarySteps(live, ctx.category)) {
      page.stepTo(i);
      await wait(250);
      const line = narrateStep(live[i]);
      if (line) await say(line);
    }

    /* ------------------- run the rest, then wrap up ------------------ */
    await say('You get the idea! Let me run the rest at full speed.');
    page.setSpeed(5);
    if (has(T('play'))) {
      point(T('play'));
      await click(T('play'));
    }
    point(T('stage'));
    await until(() => !page.get().isPlaying, 60000);
    page.restoreSpeed();
    const finalStep = live[lastIdx];
    const closing = narrateStep(finalStep);
    if (closing) await say(closing);
    await say(`And that is ${name}, from the first step to the last.`);
  }

  /* --------------------------- goodbye ------------------------------ */
  point(null);
  await say('That is everything! Now it is your turn. Pick an algorithm, press play, and experiment as much as you like. If you ever want me back, just click the Teach button. See you soon!');
}
