FROM ubuntu:jammy

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get -y update
RUN apt-get -qq install python3-six software-properties-common
RUN add-apt-repository -yn ppa:maveonair/helix-editor
RUN apt-get -y update && apt-get -y install helix curl unzip
RUN curl -fsSL https://bun.sh/install | bash
RUN ln -s /root/.bun/bin/bun /usr/bin/node
ENV PATH="${PATH}:/root/.bun/bin"
RUN bun install -g typescript typescript-language-server
WORKDIR /app
