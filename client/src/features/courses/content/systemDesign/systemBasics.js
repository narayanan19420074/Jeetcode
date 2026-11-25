import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const whatIsSystemDesign = lesson('l1', 'What is system design?', 15, [
  text('System design is the process of choosing the parts of a software system, how they connect and how they behave under load and failure, so that the system meets its requirements. It is about trade-offs: every choice gains something and costs something.'),
  heading('Requirements come first'),
  bullets('Functional requirements: what the system does, such as "a user can post a photo"', 'Non-functional requirements: how well it does it, such as latency, availability, durability, consistency, security and cost', 'Constraints: team size, budget, deadlines and existing technology'),
  heading('A framework for any design problem'),
  bullets('Clarify the requirements and the scale', 'Estimate traffic and storage', 'Sketch the high-level design: clients, services, data stores', 'Go deep on the hardest parts, such as the data model and the bottleneck', 'Discuss trade-offs, failure cases and how you would monitor it'),
  note('There is no single correct design. A good answer states its assumptions and explains why the chosen trade-off fits the requirements.'),
], [
  predict('e1', 'Which of these is a non-functional requirement?', '', ['Users can reset their password', 'Search results appear within 300 ms for most requests', 'Admins can export a report', 'Users can follow other users'], 1, 'A latency target describes how well the system works, not what it does.'),
  task('e2', 'List three clarifying questions you would ask before designing a photo-sharing app.', 'Ask about users, scale and the key features.', 'How many daily active users do we expect?\nCan users upload videos as well as photos?\nDo we need a feed, comments and notifications in the first version?'),
]);

const networkingBasics = lesson('l2', 'Networking basics', 20, [
  text('Almost every system design involves requests that travel over a network. Know the path of one request.'),
  bullets('DNS turns a name such as example.com into an IP address', 'TCP gives a reliable, ordered connection; a TLS handshake on top of it adds encryption (HTTPS)', 'HTTP defines requests and responses on top of that connection', 'The server processes the request, possibly calling a database or other services, and sends a response'),
  heading('Latency and bandwidth'),
  text('Latency is the time one request takes. Bandwidth is how much data can move per second. Distance matters: a round trip inside one data centre takes well under a millisecond, while a round trip between continents takes about a hundred milliseconds or more.'),
  code('GET /users/42 HTTP/1.1\nHost: api.example.com\nAccept: application/json'),
  note('Every extra network call adds latency and a chance of failure. Designs that need ten sequential calls per page are slow and fragile.'),
], [
  predict('e1', 'Which component translates a domain name into an IP address?', '', ['TCP', 'DNS', 'TLS', 'CDN'], 1, 'The Domain Name System resolves names to addresses.'),
  task('e2', 'Why is calling five services one after another for a single page request a risk? Give two reasons.', 'Think about time and failure.', 'The latencies add up, so the page is slow.\nThe chance that at least one call fails grows with every call.'),
]);

const scalabilityAndAvailability = lesson('l3', 'Scalability, availability and reliability', 25, [
  text('Scalability is the ability to handle more load. You can scale vertically (a bigger machine) or horizontally (more machines). Vertical scaling is simple but has a ceiling and a single point of failure. Horizontal scaling needs the application to run on many machines, which is why stateless servers matter.'),
  heading('Availability'),
  text('Availability is the share of time the system works, written in "nines". Redundancy, which means having more than one copy of every critical part, is the main tool.'),
  bullets('99.9% ("three nines") allows about 8.8 hours of downtime per year', '99.99% allows about 53 minutes per year', '99.999% allows about 5 minutes per year'),
  heading('Reliability'),
  text('Reliability means the system keeps working correctly when parts fail. Faults are inevitable; the goal is to keep a fault from becoming a failure for users.'),
  note('Keep application servers stateless by storing sessions and files outside them. Then any server can handle any request and you can add or remove servers freely.'),
], [
  predict('e1', 'Roughly how much downtime per year does 99.9% availability allow?', '', ['About 5 minutes', 'About 53 minutes', 'About 8.8 hours', 'About 3.6 days'], 2, 'One tenth of one percent of a year is about 8.8 hours.'),
  task('e2', 'Explain in two sentences why stateless servers make horizontal scaling easier.', 'Think about what happens if the next request goes to a different server.', 'A stateless server keeps no user data between requests, so any server can answer any request. A load balancer can then spread traffic across as many servers as needed.'),
]);

const estimation = lesson('l4', 'Back-of-the-envelope estimation', 25, [
  text('Estimation tells you the order of magnitude of traffic and storage, which decides whether you need one database or a hundred. Round aggressively and show your steps.'),
  heading('Handy numbers'),
  bullets('One day has 86,400 seconds, so use about 100,000 as a shortcut', '1 million requests per day is about 12 requests per second', 'Peak traffic is often 2 to 5 times the average', '1 KB = 1,000 bytes, 1 MB = 1,000 KB, 1 GB = 1,000 MB'),
  heading('Worked example'),
  text('A service gets 50 million requests per day. Average per second is 50,000,000 / 86,400, which is about 580. At a peak of 3 times, plan for about 1,700 requests per second. If every request writes 2 KB, storage grows by 50,000,000 x 2 KB = 100 GB per day.'),
  code('requests_per_day = 50_000_000\nper_second = requests_per_day / 86_400\nprint(round(per_second))', '579'),
  note('The exact number is not the point. Being within a factor of two or three is enough to choose the right architecture.'),
], [
  predict('e1', 'About how many requests per second is 100 million requests per day (average)?', '', ['About 120', 'About 1,200', 'About 12,000', 'About 120,000'], 1, '100,000,000 / 86,400 is about 1,157, so roughly 1,200 per second.'),
  task('e2', 'A service stores 1 KB per new user and gets 2 million new users per day. How much storage does it add per day and per year?', 'Multiply, then convert units.', '2,000,000 x 1 KB = 2 GB per day.\n2 GB x 365 = about 730 GB per year.'),
]);

const apis = lesson('l1', 'API design', 25, [
  text('An API is the contract between a client and a service. REST over HTTP is the most common style: resources are nouns, and HTTP methods are the verbs.'),
  bullets('GET reads, POST creates, PUT replaces, PATCH changes part of a resource, DELETE removes', 'Use status codes correctly: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 429 Too Many Requests, 500 Internal Server Error, 503 Service Unavailable'),
  code('GET    /v1/orders?limit=20&cursor=abc123\nPOST   /v1/orders\nGET    /v1/orders/987\nDELETE /v1/orders/987'),
  heading('Pagination and idempotency'),
  text('Never return unlimited lists: use pagination, preferably cursor-based, which stays correct while data changes. A request is idempotent when repeating it has the same effect as sending it once. GET, PUT and DELETE are idempotent; POST is not, so payment APIs accept an idempotency key that lets a client retry safely.'),
  note('Version the API from the start (/v1/) so you can change it without breaking existing clients.'),
], [
  predict('e1', 'A client retries a POST /payments after a timeout. What helps avoid charging twice?', '', ['A bigger timeout', 'An idempotency key sent with the request', 'Using GET instead', 'Compressing the body'], 1, 'The server stores the key with the result and returns the same result for a repeated key.'),
  task('e2', 'Design the endpoints to create, read, update and delete a "comment" that belongs to a post.', 'Nest the comment under the post.', 'POST   /v1/posts/{postId}/comments\nGET    /v1/posts/{postId}/comments/{commentId}\nPATCH  /v1/posts/{postId}/comments/{commentId}\nDELETE /v1/posts/{postId}/comments/{commentId}'),
]);

const databases = lesson('l2', 'Databases: SQL, NoSQL and indexes', 30, [
  text('Choose the data store from the access pattern, not from fashion.'),
  bullets('Relational (SQL): tables, joins, transactions and a strict schema; the best default for structured data such as orders and accounts', 'Document stores: flexible JSON-like records read as one unit', 'Key-value stores: very fast lookups by key, used for sessions and caches', 'Wide-column and time-series stores: very high write volume', 'Graph databases: data where relationships are the main query'),
  heading('Indexes'),
  text('An index is an extra structure, usually a B-tree, that lets the database find rows without scanning the whole table. It speeds up reads and slows down writes, and uses storage.'),
  code('CREATE INDEX idx_orders_user_created\n  ON orders (user_id, created_at);\n\nSELECT * FROM orders\nWHERE user_id = 42\nORDER BY created_at DESC\nLIMIT 20;'),
  note('Index the columns you filter and sort by, and in the order the query uses them. Do not index everything, because each index makes writes slower.'),
], [
  predict('e1', 'Which store fits user session data that is read and written by a key at very high speed?', '', ['A relational database with many joins', 'A key-value store', 'A graph database', 'A data warehouse'], 1, 'Lookup by key with no joins is exactly what key-value stores do best.'),
  task('e2', 'Write an index that speeds up: SELECT * FROM messages WHERE chat_id = 5 ORDER BY sent_at DESC LIMIT 50;', 'Put the filter column first, then the sort column.', 'CREATE INDEX idx_messages_chat_sent ON messages (chat_id, sent_at);'),
]);

const caching = lesson('l3', 'Caching', 25, [
  text('A cache keeps a copy of data in a faster place so repeated reads are cheap. Memory is far faster than disk or a network call, so a good cache can remove most of the load from the database.'),
  heading('Where to cache'),
  bullets('Browser and CDN: static files and public pages', 'Application cache such as Redis or Memcached: query results and computed values', 'Database buffer cache: managed for you'),
  heading('Strategies'),
  bullets('Cache-aside: the app reads the cache, loads from the database on a miss and then fills the cache', 'Write-through: every write goes to the cache and the database together', 'Write-back: write to the cache first and save to the database later (fast, but data can be lost)'),
  code('def get_user(user_id):\n    user = cache.get(f"user:{user_id}")\n    if user is None:\n        user = db.load_user(user_id)\n        cache.set(f"user:{user_id}", user, ttl=300)\n    return user'),
  note('The hard part is invalidation. Set a time to live (TTL) on entries and delete or update the cached copy when the source data changes.', 'warning'),
], [
  predict('e1', 'In cache-aside, what happens on a cache miss?', '', ['The request fails', 'The app loads from the database and stores the result in the cache', 'The cache loads from the database by itself and the app waits', 'The cache is cleared'], 1, 'The application owns the logic: it fetches from the source and then fills the cache.'),
  task('e2', 'Name two risks of caching and one way to reduce each.', 'Think about stale data and a cold cache.', 'Stale data: set a short TTL and invalidate on writes.\nCold cache after a restart overloading the database: warm the cache first or limit concurrent loads.'),
]);

const loadBalancing = lesson('l4', 'Load balancing', 20, [
  text('A load balancer spreads incoming requests across several servers, so no single server is overloaded and a failed server can be skipped. It also gives clients one stable address.'),
  heading('Algorithms'),
  bullets('Round robin: servers take turns', 'Least connections: send to the server with the fewest active requests', 'Hash-based: the same client or key goes to the same server (sticky sessions)'),
  heading('Layers'),
  bullets('Layer 4 balancers route by IP address and port and are very fast', 'Layer 7 balancers read HTTP, so they can route by path or header and terminate TLS'),
  text('Health checks remove unhealthy servers from rotation. The load balancer itself must not be a single point of failure, so run at least two.'),
  note('Prefer stateless servers over sticky sessions. Stickiness makes uneven load and harder failover.'),
], [
  predict('e1', 'Which algorithm is best when requests take very different amounts of time?', '', ['Round robin', 'Least connections', 'Random', 'Always the first server'], 1, 'Least connections adapts to slow requests by sending new work to the least busy server.'),
  task('e2', 'Explain why health checks matter and how often a load balancer might run them.', 'They keep traffic away from broken servers.', 'Health checks detect a server that is down or failing and take it out of rotation so users do not see errors. They typically run every few seconds, and a server returns after it passes several checks in a row.'),
]);

export const systemFoundations = courseModule('b1', 'beginner', 'Foundations', [whatIsSystemDesign, networkingBasics, scalabilityAndAvailability, estimation]);
export const systemBuildingBlocks = courseModule('b2', 'beginner', 'Core building blocks', [apis, databases, caching, loadBalancing]);
