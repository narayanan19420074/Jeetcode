import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const monolithVsMicroservices = lesson('l1', 'Monolith or microservices?', 25, [
  text('A monolith is one deployable application. Microservices split the system into small services that each own one business capability and their own data, and talk over the network.'),
  bullets('Monolith: simple to build, test and deploy; one codebase; fast calls inside one process; scales as a whole', 'Microservices: teams deploy and scale independently and can use different technology; cost is network failures, distributed data, harder debugging and more operations work'),
  heading('A sensible path'),
  text('Start with a well-structured monolith with clear module boundaries. Split a part into a service when a real need appears, such as a team boundary, very different scaling needs or a different release speed.'),
  note('Microservices that share one database are a distributed monolith: all the cost, none of the independence.', 'warning'),
], [
  predict('e1', 'Which is a genuine reason to extract a service from a monolith?', '', ['It sounds modern', 'The image-processing part needs 20 times more compute than the rest', 'Developers like new tools', 'The monolith has 5 endpoints'], 1, 'A very different scaling need is a concrete reason to run that part separately.'),
  task('e2', 'List three costs a team takes on when moving from a monolith to microservices.', 'Think about the network, data and operations.', 'Network calls that can fail or be slow.\nData spread across services, so no simple joins or transactions.\nMore deployment, monitoring and debugging work.'),
]);

const gatewayAndDiscovery = lesson('l2', 'API gateway and service discovery', 20, [
  text('With many services, clients should not need to know each one. An API gateway is the single entry point: it routes requests, authenticates, applies rate limits, and can combine responses.'),
  bullets('Routing: /orders goes to the order service, /users to the user service', 'Cross-cutting rules in one place: authentication, TLS, logging, limits', 'A backend-for-frontend gateway can shape responses for web and mobile clients'),
  heading('Service discovery'),
  text('Instances start, stop and move, so their addresses change. A registry (for example Consul, or Kubernetes DNS) keeps the current list of healthy instances, and callers look a service up by name instead of by IP address.'),
  code('GET https://api.example.com/orders/987\n  -> gateway checks the token and the rate limit\n  -> routes to http://orders-service/orders/987'),
  note('Keep the gateway thin. Business logic in the gateway turns it into a bottleneck that every team has to change.'),
], [
  predict('e1', 'Why do services look each other up by name instead of by IP address?', '', ['Names are shorter', 'Instances start and stop, so IP addresses change', 'IP addresses are not allowed in HTTP', 'Names are encrypted'], 1, 'Discovery gives the current address of a healthy instance.'),
  task('e2', 'Name three things an API gateway can do for every request before it reaches a service.', 'Think of the cross-cutting concerns.', 'Authenticate the caller, apply rate limits and log the request (also: terminate TLS, route to the right service).'),
]);

const resilience = lesson('l3', 'Resilience patterns', 30, [
  text('In a distributed system calls fail, time out or run slowly. Resilience patterns stop one slow dependency from bringing down everything that calls it.'),
  bullets('Timeouts: never wait forever; set a limit on every network call', 'Retries with exponential backoff and jitter: wait 1s, 2s, 4s plus a random amount, and retry only idempotent calls', 'Circuit breaker: after repeated failures stop calling the dependency for a while and fail fast', 'Bulkheads: separate pools of resources so one failing feature cannot use them all', 'Fallbacks: return cached or default data when the real answer is unavailable'),
  code('import random\nimport time\n\ndef call_with_retry(request, attempts=4):\n    for attempt in range(attempts):\n        try:\n            return request()\n        except TimeoutError:\n            if attempt == attempts - 1:\n                raise\n            time.sleep(2 ** attempt + random.random())'),
  note('Retries without backoff and jitter can create a retry storm that keeps a struggling service down. Always add both.', 'warning'),
], [
  predict('e1', 'What does a circuit breaker do after many consecutive failures?', '', ['Retries faster', 'Stops calling the dependency for a while and fails fast', 'Restarts the database', 'Doubles the timeout'], 1, 'It opens the circuit, so callers fail immediately instead of waiting on a broken service.'),
  task('e2', 'Why is adding jitter (a random delay) to retries important when thousands of clients fail at the same time?', 'Think about what happens when all clients retry together.', 'Without jitter all clients retry at the same moments, creating repeated traffic spikes. Random delays spread the retries out so the service can recover.'),
]);

const urlShortener = lesson('l1', 'Case study: URL shortener', 30, [
  text('Design a service that turns a long URL into a short one and redirects visitors. Reads (redirects) are far more frequent than writes.'),
  heading('Requirements and estimates'),
  bullets('Functional: create a short link, redirect, optional expiry', 'Non-functional: redirect in a few tens of milliseconds, high availability, links never collide', 'Scale: 100 million new links per month is about 40 writes per second; with a 100 to 1 read ratio that is about 4,000 redirects per second'),
  heading('Design'),
  bullets('API: POST /v1/links returns a short code; GET /{code} answers 301 or 302 with the long URL', 'Short code: base62 (a to z, A to Z, 0 to 9). Seven characters give 62 to the power of 7, about 3.5 trillion codes', 'Generate codes from a unique counter encoded in base62, or from a pre-generated pool, to avoid collisions', 'Store code to URL in a key-value or relational store, with the code as the key', 'Cache hot codes in memory; most traffic goes to a small set of links'),
  note('Use 302 if you want every click to reach your server for analytics. A 301 can be cached by browsers, which reduces load but hides repeat clicks.'),
], [
  predict('e1', 'How many base62 characters are enough for 1 billion links? (62^5 is about 916 million, 62^6 is about 57 billion)', '', ['5', '6', '7', '10'], 1, 'Five characters cover less than a billion codes. Six cover about 57 billion.'),
  task('e2', 'Explain why hashing the long URL and taking the first 7 characters is risky, and suggest an alternative.', 'Think about two URLs getting the same code.', 'Different URLs can produce the same prefix (a collision), so one link would overwrite or hide another. Use a unique counter encoded in base62, which never repeats.'),
]);

const chatSystem = lesson('l2', 'Case study: chat system', 30, [
  text('Design one-to-one and group messaging, like a messaging app. Users expect messages to arrive instantly and never be lost.'),
  heading('Key decisions'),
  bullets('Connection: WebSockets keep a persistent two-way connection so the server can push messages', 'Chat servers hold the connections; a presence service tracks who is online', 'Flow: sender to chat server, message stored, then pushed to the receiver if online or sent as a push notification if offline', 'Ordering: give each message an increasing ID within a conversation', 'Storage: messages are written constantly and read by conversation and time, so a wide-column or key-value store partitioned by conversation ID fits well'),
  heading('Reliability'),
  text('Use acknowledgements: the server confirms receipt to the sender, the receiver confirms delivery. Retries with message IDs make delivery safe when messages are sent twice.'),
  note('For group chats with many members, send one message to a queue and let workers fan it out to each member, rather than blocking the sender.'),
], [
  predict('e1', 'Why are WebSockets a better fit than repeated HTTP polling for chat?', '', ['They are encrypted by default', 'The server can push messages as soon as they arrive, without constant requests', 'They need no servers', 'They guarantee ordering'], 1, 'A persistent connection lets the server send immediately and avoids wasteful polling.'),
  task('e2', 'How would you deliver a message to a user who is offline?', 'Store it and notify.', 'Store the message durably, send a push notification, and deliver the stored messages in order when the user reconnects, using last-seen message ID to know what is missing.'),
]);

const newsFeed = lesson('l3', 'Case study: news feed', 30, [
  text('Design a feed that shows recent posts from the people a user follows. The central question is when to build each user feed.'),
  bullets('Fan-out on read (pull): when a user opens the feed, fetch recent posts from everyone they follow and merge them; cheap to write, slow to read', 'Fan-out on write (push): when someone posts, add the post ID to every follower feed in a cache; reads are very fast, writes are expensive for accounts with millions of followers', 'Hybrid: push for normal accounts and pull for very popular accounts, then merge'),
  heading('Components'),
  bullets('Post service stores posts', 'Follow graph service returns followers and following lists', 'Fan-out workers read from a queue and update feed caches', 'Feed cache holds the latest post IDs per user, and posts are loaded by ID', 'Ranking can order the feed by relevance instead of time'),
  note('The hybrid approach is the typical answer. It uses each strategy where it is cheapest.'),
], [
  predict('e1', 'Why is pure fan-out on write a problem for an account with 50 million followers?', '', ['Posts cannot be stored', 'One post triggers 50 million feed updates', 'Followers cannot read it', 'It needs no cache'], 1, 'The write amplification is huge. Handling such accounts with pull avoids it.'),
  task('e2', 'Describe how a hybrid feed works for a user who follows 200 normal accounts and 2 celebrities.', 'Combine the pre-built feed with a live fetch.', 'Posts from the 200 normal accounts are already in the user feed cache (push). When the feed is opened, recent posts from the 2 celebrities are fetched (pull) and merged into it.'),
]);

const observability = lesson('l1', 'Observability and SLOs', 25, [
  text('You cannot run what you cannot see. Observability is the ability to understand what a system is doing from the data it produces.'),
  bullets('Metrics: numbers over time, such as request rate, error rate and latency percentiles', 'Logs: structured records of events, with a request ID so one request can be followed across services', 'Traces: the path of one request through many services, with the time spent in each'),
  heading('Percentiles'),
  text('Averages hide pain. If 1 in 100 requests takes 5 seconds, the average looks fine but some users suffer. Track p50, p95 and p99 latency.'),
  heading('SLIs, SLOs and alerts'),
  text('A service level indicator (SLI) is a measurement, such as the share of requests answered in under 300 ms. A service level objective (SLO) is the target, such as 99.9% over 30 days. Alert on user-visible symptoms that threaten the SLO, not on every CPU spike.'),
], [
  predict('e1', 'Which metric best shows how the slowest 1% of users experience a service?', '', ['Average latency', 'p99 latency', 'CPU usage', 'Request count'], 1, 'p99 is the latency that 99% of requests are faster than, so it exposes the slow tail.'),
  task('e2', 'Write one SLI and one SLO for a checkout API.', 'Measure success and set a target.', 'SLI: the proportion of checkout requests that return a successful response within 500 ms.\nSLO: at least 99.9% of checkout requests meet that over 30 days.'),
]);

const securityBasics = lesson('l2', 'Security basics for system design', 25, [
  text('Security is part of the design, not a later step. Start with a few principles.'),
  bullets('Authentication proves who the caller is; authorization decides what they may do. Check authorization on the server for every request', 'Encrypt data in transit with TLS and at rest with managed keys', 'Least privilege: each service and person gets only the access they need', 'Validate and sanitise every input to prevent injection; use parameterised queries', 'Store passwords only as salted hashes made with a slow algorithm such as bcrypt or Argon2', 'Keep secrets in a secret manager, never in code or logs', 'Log security events and rate-limit sensitive endpoints'),
  code('# Parameterised query: the value is never joined into the SQL text\ncursor.execute("SELECT * FROM users WHERE email = %s", (email,))'),
  note('The OWASP Top 10 is a good checklist of the most common web application risks.'),
], [
  predict('e1', 'Which approach prevents SQL injection?', '', ['Joining user input into the query string', 'Parameterised queries', 'Hiding the database name', 'Making the input longer'], 1, 'Parameters keep data separate from the SQL command, so input cannot change the query.'),
  task('e2', 'Explain the difference between authentication and authorization with one example.', 'One is who you are, the other is what you can do.', 'Authentication confirms the user is Asha (a valid login). Authorization decides whether Asha may view another user invoice (she may not, unless she is an admin).'),
]);

export const architectureModule = courseModule('a1', 'advanced', 'Service architecture', [monolithVsMicroservices, gatewayAndDiscovery, resilience]);
export const caseStudies = courseModule('a2', 'advanced', 'Case studies', [urlShortener, chatSystem, newsFeed]);
export const operatingModule = courseModule('a3', 'advanced', 'Operating in production', [observability, securityBasics]);
