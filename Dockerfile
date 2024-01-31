ARG GLIBC_RELEASE=2.34-r0
ARG release=latest

FROM alpine:latest as get-latest

WORKDIR /tmp
# get bun latest release
ADD https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64.zip bun-linux-x64.zip

FROM alpine:latest as get-canary

WORKDIR /tmp
# get bun canary release
ADD https://github.com/oven-sh/bun/releases/download/canary/bun-linux-x64.zip bun-linux-x64.zip

FROM get-${release} as get-release

RUN apk --no-cache add unzip
RUN unzip bun-linux-x64.zip && chmod +x ./bun-linux-x64/bun

# get glibc
ARG GLIBC_RELEASE
RUN wget https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_RELEASE}/glibc-${GLIBC_RELEASE}.apk

### Helix build ###
FROM alpine:latest as helix
RUN apk --no-cache add helix alpine-sdk
RUN hx --grammar fetch; exit 0
RUN hx --grammar build; exit 0

### FINAL IMAGE ###
FROM alpine:latest as final

ARG GLIBC_RELEASE

COPY --from=get-release /tmp/bun-linux-x64/bun /usr/local/bin/ 
COPY --from=get-release /tmp/sgerrand.rsa.pub /etc/apk/keys
COPY --from=get-release /tmp/glibc-${GLIBC_RELEASE}.apk /tmp
COPY --from=helix /usr/bin/hx /usr/bin/hx
COPY --from=helix /usr/share/helix /usr/share/helix
COPY --from=helix /root/.config/helix/runtime/grammars /usr/share/helix/runtime/grammars

# install glibc
RUN apk --no-cache add --force-overwrite libgcc bash /tmp/glibc-${GLIBC_RELEASE}.apk && \
# cleanup
    rm /etc/apk/keys/sgerrand.rsa.pub && \
    rm /tmp/glibc-${GLIBC_RELEASE}.apk && \
# smoke test
    bun --version

RUN echo -e '#!/bin/sh\n\
set -e\n\
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then\n\
  set -- bun "$@"\n\
fi\n\
exec "$@"\n ' > /entrypoint.sh

ENV PATH="${PATH}:/root/.bun/bin"
ADD ./.helix /root/.config/helix
RUN ln -s /usr/local/bin/bun /usr/local/bin/node
RUN bun install -g typescript typescript-language-server
RUN chmod +x /entrypoint.sh 
WORKDIR /app

ENTRYPOINT [ "/entrypoint.sh" ]
