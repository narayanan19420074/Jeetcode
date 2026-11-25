import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const whatIsAnLlm = lesson('l1', 'What an AI model really is', 20, [
  text('Start from the simplest true statement: a large language model (LLM) is a program that reads text and predicts what text should come next, one small piece at a time. Everything else you see, such as answering questions, writing code and planning, comes from doing that one thing extremely well.'),
  heading('Two phases'),
  bullets('Training: the model reads a huge amount of text and code and adjusts billions of internal numbers (parameters) so its predictions get better. This happens once, before you ever use it.', 'Inference: you send text in, and the model generates text out. This is what happens every time you chat or run an agent.'),
  heading('What follows from this'),
  text('The model does not look facts up in a database. It generates the most plausible continuation of what you gave it. That is why it is brilliant at patterns (writing, refactoring, translating, explaining) and why it can also state something false in a confident voice. This is called a hallucination.'),
  bullets('Strong at: drafting, transforming, explaining, following a pattern, suggesting options, writing boilerplate and tests', 'Weak at: exact facts it was not given, long exact arithmetic, anything newer than its training data, knowing your private project unless you show it'),
  note('Pattern: treat AI as a very fast, very well-read junior colleague who never says "I do not know". Give it context, ask for evidence, and check the work.'),
], [
  predict('e1', 'Why can an AI model state a wrong fact in a confident tone?', '', ['It is lying on purpose', 'It generates plausible text and does not verify facts', 'It has no training data', 'The internet connection is slow'], 1, 'It predicts likely text. Plausible and true are not the same thing, so facts need sources or checks.'),
  task('e2', 'List three tasks you would trust AI with and three results you would always verify yourself.', 'Think about pattern work versus exact facts.', 'Trust: drafting boilerplate, renaming and refactoring, explaining an error message.\nVerify: package names and versions, security-sensitive code, numbers, dates and legal or money rules.'),
]);

const tokens = lesson('l2', 'Tokens and tokenization', 25, [
  text('The model does not read letters or words. A tokenizer first cuts your text into tokens: small chunks such as a whole common word, part of a rarer word, a number or a punctuation mark. The model only ever sees and produces tokens.'),
  code('"Hello world"       ->  Hello | world\n"unbelievable"      ->  un | believ | able      (example split, real splits vary)\n"print(total)"      ->  print | ( | total | )'),
  heading('Rules of thumb'),
  bullets('In English, 1 token is about 4 characters, or about three quarters of a word. 100 tokens are about 75 words.', 'Code, numbers and unusual symbols often use more tokens than plain prose.', 'Languages other than English, including Tamil, usually need more tokens for the same meaning, so they cost more and fit less in one request.'),
  heading('Why tokens matter'),
  bullets('Cost: you are billed for input tokens (what you send) and output tokens (what it writes).', 'Limit: the context window is measured in tokens (next lesson).', 'Speed: more tokens in and out means a slower answer.'),
  code('// A quick estimate when you have no tokenizer at hand\nconst estimateTokens = (text) => Math.ceil(text.length / 4);\n\nconsole.log(estimateTokens("x".repeat(2000)));', '500'),
  note('Pattern: tokens are the currency. Every word you send, every file the AI reads and every word it writes is spent from the same budget.'),
], [
  predict('e1', 'About how many tokens is a 6,000-character English document?', '', ['About 150', 'About 1,500', 'About 15,000', 'About 60,000'], 1, '6,000 characters divided by 4 is about 1,500 tokens.'),
  task('e2', 'A server log has 40,000 characters. Estimate its tokens and say what you should send to the AI instead of the whole file.', 'Divide by 4, then think about what part of the log shows the problem.', 'About 10,000 tokens. Send only the error lines and a few lines around them (for example the last 50 lines), not the full log.'),
]);

const contextWindow = lesson('l3', 'Context window, memory and why chats forget', 25, [
  text('The context window is the maximum number of tokens the model can look at in one go. It holds everything: the instructions, the whole conversation so far, every file it read, every tool result and the answer it is writing.'),
  heading('The model is stateless'),
  text('The model itself remembers nothing between requests. A chat feels continuous because the app sends the entire conversation again with every new message. "Memory" is just text that is re-sent.'),
  code('// Request 1\n[{ role: "user", content: "My project is a todo app." }]\n\n// Request 2: the app re-sends the history and adds the new message\n[\n  { role: "user", content: "My project is a todo app." },\n  { role: "assistant", content: "Great. What features?" },\n  { role: "user", content: "Add dark mode." }\n]'),
  heading('A bigger window is not a free lunch'),
  bullets('Every request re-sends the history, so long chats cost more and run slower.', 'As the window fills with old, irrelevant content, answers get worse: instructions are missed and mistakes increase.', 'When the limit is reached, old content is cut off or summarised, and details are lost.'),
  note('Pattern: context is a desk, not a brain. Keep only the papers you are working on on the desk, and store everything else in files you can fetch later.'),
], [
  predict('e1', 'In a very long chat the AI ignores an instruction you gave at the start. What is the most likely reason?', '', ['The AI got bored', 'The instruction is lost or diluted in a crowded context', 'The instruction was too polite', 'The model was retrained overnight'], 1, 'The window is full of other text, so early instructions get less influence or are dropped.'),
  task('e2', 'Name four things you would move out of the chat and into project files so a new chat can pick them up.', 'Think about what a new team member would need to read.', 'The project rules, the feature spec, the plan with its checklist, and the decisions made (and why).'),
]);

const prompts = lesson('l4', 'Prompts: say what, why, where and how', 30, [
  text('A prompt is the text you give the model. Because the model continues what it sees, the quality of its answer follows the quality of your input. Use one simple pattern every time: Goal, Context, Rules, Format.'),
  code('GOAL:    Add a "forgot password" link to the login page.\nCONTEXT: Next.js app. Login form is in app/login/page.tsx. We use the Button component from components/ui.\nRULES:   Do not change the API. Match the existing style. Keep the change under 30 lines.\nFORMAT:  Show a short plan first, then the changed files, then how to test it.'),
  heading('Roles'),
  bullets('System: standing rules set by the developer or tool (who you are, what to avoid)', 'User: your request', 'Assistant: the model reply', 'Tool: results from commands, files or searches that the model asked for'),
  heading('Four habits that improve any prompt'),
  bullets('Be specific about the outcome, not only the topic', 'Show one example of the style or format you want (few-shot prompting)', 'Give permission to say "I am not sure" and ask questions when information is missing', 'Break big requests into small steps'),
  note('Pattern: Goal, Context, Rules, Format. If a prompt is missing one of the four, the AI will guess it, and guesses are where bugs start.'),
], [
  predict('e1', 'Which prompt is best?', '', ['Make a login page', 'Make a nice login page with good design', 'Goal: login page for our Next.js app. Context: use the existing Button component and our design tokens. Rules: email and password only, show errors under each field. Format: list the files you change.', 'Login'], 2, 'It states the goal, the context, the rules and the output format, so little is left to guess.'),
  task('e2', 'Rewrite "add search to my site" as a Goal, Context, Rules, Format prompt for a blog built with Next.js.', 'Decide what is searched, where the data lives and what the result should look like.', 'GOAL: Add a search box that filters blog posts by title.\nCONTEXT: Next.js blog, posts are in the posts folder as markdown, list page is app/blog/page.tsx.\nRULES: No new libraries, keyboard accessible, debounce typing.\nFORMAT: Plan first, then code, then manual test steps.'),
]);

const modelsAndSettings = lesson('l5', 'Choosing a model and its settings', 20, [
  text('AI providers offer a family of models. The trade-off is always the same triangle: quality, speed and cost. You pick the point on the triangle that suits the job.'),
  bullets('Large, most capable model: slower and costlier; use for planning, architecture, hard debugging and reviews', 'Mid-size model: the everyday coding choice', 'Small, fast model: cheap and quick; use for chores such as renaming, formatting, summaries and simple edits'),
  heading('Settings you will meet'),
  bullets('Temperature: how random the output is. Low (near 0) for code, data extraction and anything that must be repeatable. Higher for brainstorming names and ideas. Some tools set it for you.', 'Reasoning or thinking mode: the model works through the problem before answering. Better on hard problems, but the thinking uses tokens and time.', 'Max output length: a cap on how much it can write in one reply', 'Multimodal input: many models also read images, PDFs and screenshots, which is very useful for UI bugs'),
  note('Pattern: right-size the model. Cheap model for chores, strong model for decisions. Do not pay a strategist to rename a variable.'),
], [
  predict('e1', 'Which model choice is sensible?', '', ['Strongest model to rename a variable in one file', 'Small fast model to rename a variable, strongest model to choose the app architecture', 'Smallest model for every task', 'Always the model with the longest name'], 1, 'Match the model to the difficulty of the task.'),
  task('e2', 'Fill in a model choice (small, mid or strong) for: fix typo, add a new API route, design the database for a booking app, summarise a 5-page document.', 'Think about difficulty and risk.', 'Fix typo: small. Add a new API route: mid. Design the database for a booking app: strong. Summarise a 5-page document: small or mid.'),
]);

export const aiFundamentalsModule = courseModule('b1', 'beginner', 'AI fundamentals', [whatIsAnLlm, tokens, contextWindow, prompts, modelsAndSettings]);
