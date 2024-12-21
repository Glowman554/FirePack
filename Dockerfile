FROM glowman554/deno

WORKDIR /srv
COPY . .

RUN deno task build:backend

ENTRYPOINT [ "deno", "run", "-A", "dist/backend.js" ]⏎   