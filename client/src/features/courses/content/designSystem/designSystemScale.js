import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const documentationAndGovernance = lesson('l1', 'Documentation and governance', 25, [
  text('A system is only used if people can find, understand and trust it. Documentation and governance keep it alive after the first release.'),
  heading('What good documentation holds'),
  bullets('Live examples next to the code and the design file', 'When to use a component and when not to', 'Accessibility notes and keyboard behaviour', 'Do and don\'t examples', 'A changelog written for the people who use it'),
  heading('Governance'),
  text('Governance answers who decides. Decide how requests arrive, who reviews them, how fast they get an answer and what counts as a good addition: used by at least two products, accessible and documented.'),
  note('A design system is a product with users. Its users are designers and developers, so give it a roadmap, support and a feedback channel.'),
], [
  predict('e1', 'What is the best reason to require an addition to be used by at least two products?', '', ['It keeps the system small forever', 'It avoids adding one-off parts that do not generalise', 'It speeds up reviews', 'It removes the need for documentation'], 1, 'A part that only one team needs is better kept in that product until the need is proven.'),
  task('e2', 'Write a short contribution checklist a team must satisfy before a new component joins the system.', 'Think of design, code, accessibility and docs.', 'Used or needed by at least two products.\nDesigned with all variants and states.\nImplemented with tests and keyboard support.\nMeets WCAG AA.\nDocumented with usage guidance and examples.'),
]);

const versioning = lesson('l2', 'Versioning and contribution models', 20, [
  text('Teams consume your system as a package, so changes must be predictable. Semantic Versioning (semver) gives every release a number in the form MAJOR.MINOR.PATCH.'),
  bullets('PATCH (1.4.1 to 1.4.2): bug fixes that change nothing for users', 'MINOR (1.4.2 to 1.5.0): new features that stay compatible', 'MAJOR (1.5.0 to 2.0.0): breaking changes, with a migration guide'),
  heading('Deprecation'),
  text('Do not remove a part overnight. Mark it deprecated, say what replaces it, keep it for at least one major version and, if possible, provide a codemod that updates usage automatically.'),
  heading('Models'),
  bullets('Centralised: one core team owns everything; consistent but can become a bottleneck', 'Federated: teams contribute through a shared process; scales better but needs clear rules'),
], [
  predict('e1', 'Which release number follows 2.3.4 when a component gets a breaking API change?', '', ['2.3.5', '2.4.0', '3.0.0', '2.3.4.1'], 2, 'Breaking changes require a new major version.'),
  task('e2', 'Write a deprecation notice for an old Button prop named "type" that is replaced by "variant".', 'Say what is deprecated, what to use instead and when it will be removed.', 'The "type" prop of Button is deprecated and will be removed in v4.0. Use "variant" instead: <Button variant="primary" />.'),
]);

const measuringAdoption = lesson('l3', 'Measuring adoption and impact', 20, [
  text('You should be able to show that the system is worth its cost. Measure both use and results.'),
  bullets('Adoption: the share of screens or code that use system components rather than custom ones', 'Efficiency: time from design to shipped feature before and after the system', 'Quality: accessibility issues and UI bugs per release', 'Satisfaction: a short survey of designers and developers'),
  text('Automated checks can count how often tokens and components are used, and flag raw values such as hard-coded colours in code.'),
  note('Adoption is not a goal in itself. Low adoption usually means the system does not solve real problems yet, so ask the teams why.'),
], [
  predict('e1', 'Which metric best shows that a design system improves delivery speed?', '', ['Number of components', 'Time from design to shipped feature', 'Number of Figma pages', 'Lines of CSS'], 1, 'Speed is about how long work takes, so measure the time before and after.'),
  task('e2', 'Suggest an automated check that finds code which ignores the design tokens.', 'Think of searching the source for raw values.', 'A lint or CI script that searches the source for hard-coded colours (hex, rgb) and pixel font sizes outside the token files and fails the build when it finds new ones.'),
]);

const tokensInCode = lesson('l1', 'Tokens in code', 25, [
  text('Tokens must reach the code without manual copying. A common pipeline stores tokens in JSON, then a build tool (for example Style Dictionary) generates CSS variables, JavaScript constants and native platform files from the same source.'),
  code('/* generated: tokens.css */\n:root {\n  --color-action: royalblue;\n  --space-4: 16px;\n}\n\n/* a component uses only tokens */\n.button {\n  background: var(--color-action);\n  padding: var(--space-4);\n}'),
  heading('Themes in JavaScript'),
  code('const theme = {\n  colors: { action: "royalblue", text: "midnightblue" },\n  space: (n) => `${n * 4}px`,\n};\n\nconsole.log(theme.space(4));', '16px'),
  note('Keep one source of truth. Hand-editing a generated file will be overwritten on the next build.', 'warning'),
], [
  predict('e1', 'With space: (n) => `${n * 4}px`, what does theme.space(6) return?', '', ['"6px"', '"24px"', '"46px"', '24'], 1, '6 times 4 is 24, and the template adds the px unit, giving the string "24px".'),
  task('e2', 'Write a CSS rule for .card that uses tokens for background, border radius and padding. Assume --color-surface, --radius-card and --space-4 exist.', 'Use var() for every value.', '.card {\n  background: var(--color-surface);\n  border-radius: var(--radius-card);\n  padding: var(--space-4);\n}'),
]);

const componentLibrary = lesson('l2', 'Building a component library', 30, [
  text('A component library puts the design into reusable code. In React, each component takes props for its variants and passes accessibility details through.'),
  code('function Button({ variant = "primary", children, ...props }) {\n  return (\n    <button className={`button button--${variant}`} {...props}>\n      {children}\n    </button>\n  );\n}'),
  bullets('Accept a small, predictable set of props and forward the rest to the element', 'Support className and ref so teams can extend without forking', 'Export components, tokens and types from one package entry', 'Use Storybook to show every variant and state in isolation'),
  text('Storybook doubles as living documentation and a place to test: each story is one state of one component.'),
  note('Prefer composition over many boolean props. A Card with Card.Header and Card.Body is easier to extend than a Card with twelve options.'),
], [
  predict('e1', 'Why does the Button above forward {...props} to the button element?', '', ['To make it render faster', 'So attributes like onClick, disabled and aria-label work', 'To change the variant', 'It is required by React'], 1, 'Forwarding lets callers set native attributes and accessibility props without the library listing each one.'),
  task('e2', 'Write a Badge component that renders a span with a "tone" prop (default "neutral") used in the class name.', 'Mirror the Button example.', 'function Badge({ tone = "neutral", children }) {\n  return <span className={`badge badge--${tone}`}>{children}</span>;\n}'),
]);

const testingSystems = lesson('l3', 'Testing a design system', 25, [
  text('Because every product depends on the system, a regression spreads fast. Test at several levels.'),
  bullets('Unit and interaction tests: does the component behave correctly (click, keyboard, props)?', 'Accessibility tests: automated tools such as axe find many issues, but not all', 'Visual regression tests: compare screenshots of each Storybook story to a stored baseline', 'Manual checks: screen reader and keyboard passes before major releases'),
  code('import { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\n\ntest("calls onClick when pressed", async () => {\n  const onClick = jest.fn();\n  render(<Button onClick={onClick}>Save</Button>);\n  await userEvent.click(screen.getByRole("button", { name: "Save" }));\n  expect(onClick).toHaveBeenCalledTimes(1);\n});'),
  note('Query by role and name, as the test above does. It tests what users and assistive technology see, and it fails if the accessible name disappears.'),
], [
  predict('e1', 'Which test type catches an unintended change in how a component looks?', '', ['Unit test', 'Visual regression test', 'Type check', 'Linting'], 1, 'Visual regression compares screenshots against an approved baseline.'),
  task('e2', 'Write a Testing Library assertion that checks a button named "Delete" is disabled (the component is already rendered).', 'Find it with getByRole and use toBeDisabled.', 'expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();'),
]);

export const scalingModule = courseModule('a1', 'advanced', 'Scaling a design system', [documentationAndGovernance, versioning, measuringAdoption]);
export const engineeringModule = courseModule('a2', 'advanced', 'Engineering the system', [tokensInCode, componentLibrary, testingSystems]);
