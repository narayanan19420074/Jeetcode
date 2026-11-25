import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const replication = lesson('l1', 'Replication', 25, [
  text('Replication keeps copies of the same data on several machines. It gives high availability (another copy takes over if one fails), lower read latency (read from a nearby copy) and more read capacity.'),
  heading('Leader and followers'),
  text('The most common model has one leader that accepts writes and followers that copy its changes and serve reads.'),
  bullets('Synchronous replication: the leader waits for a follower before confirming; no data loss, but slower and less available', 'Asynchronous replication: the leader confirms at once; fast, but a follower can lag and a crash can lose recent writes'),
  heading('Replication lag'),
  text('With asynchronous followers a user may write a value and then read an older one. A common fix is read-your-writes: after a user writes, read their own data from the leader for a short time.'),
  note('Failover, which promotes a follower when the leader dies, must avoid two leaders at once (split brain). Use a proper election or a tool that handles it.', 'warning'),
], [
  predict('e1', 'A user updates a profile and immediately sees the old data. What is the most likely cause?', '', ['The CDN is down', 'Reading from an asynchronous follower that has not caught up', 'The index is missing', 'The leader is overloaded by writes only'], 1, 'Replication lag: the follower has not yet received the write.'),
  task('e2', 'Describe one benefit and one cost of synchronous replication.', 'Think about durability versus speed.', 'Benefit: no acknowledged write is lost if the leader fails.\nCost: every write waits for the follower, so it is slower and fails if the follower is unreachable.'),
]);

const sharding = lesson('l2', 'Partitioning and consistent hashing', 30, [
  text('When one machine cannot hold all the data or handle all the writes, split the data into partitions (shards) and put them on different machines.'),
  bullets('Range partitioning: key ranges per shard (A to F, G to M); good for range scans, risky for hot spots', 'Hash partitioning: shard = hash(key) mod N; spreads load evenly but breaks range queries'),
  code('def shard_for(key, shard_count):\n    return hash(key) % shard_count\n\nprint(shard_for("user:42", 4) in range(4))', 'True'),
  heading('The resharding problem'),
  text('With hash mod N, adding a shard changes N, so most keys move to a different shard. Consistent hashing fixes this: servers and keys are placed on a ring, and each key belongs to the next server clockwise. Adding or removing a server moves only the keys near it, about 1/N of the total. Virtual nodes (many ring points per server) even out the load.'),
  note('Choose the shard key carefully. A key such as country puts most traffic on a few shards. A high-cardinality key such as user ID spreads it.'),
], [
  predict('e1', 'Why is shard = hash(key) mod N a poor choice if the number of shards changes often?', '', ['It is slow to compute', 'Most keys change shards when N changes', 'It only works with strings', 'It cannot spread load evenly'], 1, 'Changing N changes the result for most keys, causing massive data movement.'),
  task('e2', 'A chat app shards messages. Compare sharding by chat_id with sharding by sent_date.', 'Look for hot spots.', 'chat_id spreads messages across shards and keeps one chat on one shard, so reads for a chat are fast.\nsent_date sends all new messages to the newest shard, creating a write hot spot.'),
]);

const consistency = lesson('l3', 'CAP theorem and consistency', 25, [
  text('In a distributed system the network can fail, which splits the nodes into groups that cannot talk to each other (a partition). The CAP theorem says that during a partition you must choose between consistency and availability.'),
  bullets('Consistency: every read sees the latest write', 'Availability: every request to a working node gets an answer', 'Partition tolerance: the system keeps working when the network splits; in practice you must have it'),
  heading('Choosing'),
  bullets('CP systems refuse some requests during a partition to avoid wrong data; good for money and inventory', 'AP systems keep answering with possibly stale data; good for feeds, likes and carts'),
  heading('Consistency models'),
  bullets('Strong: reads always see the latest write', 'Eventual: copies converge if writes stop, with no guarantee when', 'Causal and read-your-writes: in-between guarantees that avoid confusing users'),
  note('Consistency is also a product decision. A like counter can be a few seconds stale. A bank balance cannot.'),
], [
  predict('e1', 'During a network partition a CP system will most likely:', '', ['Return stale data to everyone', 'Reject or delay some requests to stay consistent', 'Delete the minority data', 'Switch to a different database'], 1, 'CP systems give up availability on the minority side to avoid returning wrong data.'),
  task('e2', 'Pick CP or AP for each: (a) seat booking, (b) social media like count. Give one reason each.', 'Ask what is worse: a wrong answer or no answer.', '(a) CP: selling the same seat twice is worse than a delay.\n(b) AP: a slightly stale count is harmless and the feature must stay available.'),
]);

const queues = lesson('l1', 'Message queues and streams', 25, [
  text('A message queue lets one part of the system hand work to another without waiting. The producer puts a message on the queue and a consumer processes it later. This decouples services, smooths traffic spikes and lets slow work happen in the background.'),
  bullets('Queues (for example RabbitMQ, Amazon SQS): each message is handled by one consumer', 'Logs and streams (for example Apache Kafka): messages are stored in order and many consumer groups can read them, and replay them'),
  heading('Delivery guarantees'),
  bullets('At most once: may lose messages', 'At least once: may deliver duplicates, so consumers must be idempotent', 'Exactly once: costly and only possible within limits'),
  code('def handle(message):\n    if already_processed(message.id):\n        return\n    send_confirmation_email(message.order_id)\n    mark_processed(message.id)'),
  note('Design for at-least-once delivery. Store a message ID so processing the same message twice has no extra effect, and use a dead-letter queue for messages that keep failing.'),
], [
  predict('e1', 'Why must consumers be idempotent with at-least-once delivery?', '', ['Messages arrive out of order', 'The same message can be delivered more than once', 'Queues are slow', 'Messages are encrypted'], 1, 'Retries can cause duplicates, so processing twice must be safe.'),
  task('e2', 'An order service must send a confirmation email. Explain why using a queue is better than sending the email inside the order request.', 'Think about speed and failure.', 'The order request finishes faster because the email is sent later. If the email provider is down the order still succeeds and the message is retried from the queue.'),
]);

const cdnAndStorage = lesson('l2', 'CDN and object storage', 20, [
  text('A content delivery network (CDN) is a network of servers around the world that cache content close to users. It lowers latency, reduces load on your servers and absorbs traffic spikes.'),
  bullets('Static files (images, scripts, video) are the best fit', 'Control freshness with Cache-Control headers and versioned file names', 'Purge a cached file when you must replace it before it expires'),
  code('Cache-Control: public, max-age=31536000, immutable'),
  heading('Object storage'),
  text('Object stores such as Amazon S3 hold large files (photos, videos, backups) cheaply and durably, by key, over HTTP. Do not store large files in your database. Store the file in object storage and keep its URL or key in the database.'),
  text('For uploads, give the client a short-lived pre-signed URL so the file goes straight to storage and never passes through your servers.'),
], [
  predict('e1', 'Where should user-uploaded profile photos be stored?', '', ['In a relational table column', 'In object storage with the URL in the database', 'In application server memory', 'In the load balancer'], 1, 'Object storage is built for large files; the database keeps the reference.'),
  task('e2', 'You deploy a new version of app.js that is cached for a year. How do you make users get it?', 'Change what the browser asks for.', 'Use a content hash in the file name, such as app.3f9a1c.js, so the new version has a new URL and the old cached file is no longer requested.'),
]);

const rateLimiting = lesson('l3', 'Rate limiting', 25, [
  text('A rate limiter caps how many requests a client can make in a period. It protects the system from abuse and overload and keeps usage fair. The server answers 429 Too Many Requests, often with a Retry-After header.'),
  heading('Algorithms'),
  bullets('Fixed window: count requests per minute; simple, but allows a burst at the window edge', 'Sliding window: smoother because it counts over the last N seconds', 'Token bucket: tokens refill at a steady rate and each request spends one, so short bursts are allowed'),
  code('class TokenBucket:\n    def __init__(self, capacity, refill_per_second):\n        self.capacity = capacity\n        self.tokens = capacity\n        self.refill = refill_per_second\n\n    def allow(self, elapsed_seconds):\n        self.tokens = min(self.capacity, self.tokens + elapsed_seconds * self.refill)\n        if self.tokens >= 1:\n            self.tokens -= 1\n            return True\n        return False'),
  note('In a distributed system keep the counters in a shared fast store such as Redis, with atomic increments, so every server sees the same count.'),
], [
  predict('e1', 'A token bucket has capacity 5 and refills 1 token per second. Six requests arrive at the same instant on a full bucket. How many are allowed?', '', ['1', '5', '6', '0'], 1, 'The bucket holds 5 tokens, so five requests pass and the sixth is rejected.'),
  task('e2', 'Which key would you rate-limit by for a public login endpoint, and why?', 'Think about who is being limited.', 'Limit by IP address and by the account name being tried. The IP limit stops one source from trying many accounts; the account limit stops many sources from guessing one password.'),
]);

export const dataAtScale = courseModule('i1', 'intermediate', 'Data at scale', [replication, sharding, consistency]);
export const asyncAndEdge = courseModule('i2', 'intermediate', 'Asynchronous work and the edge', [queues, cdnAndStorage, rateLimiting]);
