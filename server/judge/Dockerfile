# Isolated code-execution service for JeetCode.
# Built from the repository root (see render.yaml: dockerContext "."), e.g.
#   docker build -f server/judge/Dockerfile .
#
# It holds no database or auth secrets. The only secret is JUDGE_SERVICE_TOKEN, which lives in the
# root process's environment. Submitted code is spawned as the unprivileged user "nobody"
# (JUDGE_RUN_AS_UID), so it cannot read that environment or the service files.
FROM node:22-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends g++ python3 openjdk-17-jdk-headless \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY server/src ./src

ENV NODE_ENV=production \
    JUDGE_SERVICE=true \
    JUDGE_MODE=local \
    JUDGE_RUN_AS_UID=65534 \
    JUDGE_RUN_AS_GID=65534

EXPOSE 10000
# Intentionally runs as root so it can drop privileges per submission. Do not add a USER line.
CMD ["node", "src/judgeServer.js"]
