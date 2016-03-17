FROM docker-dev.ops.tune.com/itops/baseimages-centos7:latest

RUN yum -y update && \
    yum -y install tar && \
    yum -y install gcc-c++ && \
    yum -y install make && \
    yum -y clean all && \
    curl -o /tmp/node-v5.8.0-linux-x64.tar.gz https://nodejs.org/dist/v5.8.0/node-v5.8.0-linux-x64.tar.gz && \
    tar xzf /tmp/node-v5.8.0-linux-x64.tar.gz && \
    cp -rp node-v5.8.0-linux-x64 /usr/local/ && \
    ln -s /usr/local/node-v5.8.0-linux-x64 /usr/local/node

env PATH /usr/local/node/bin:$PATH

COPY . /data/www/hopper/
WORKDIR /data/www/hopper


# Install the app
# Make a directory for CIA to dump our configs into.
# templates are kept in the ./templates directory of this project.
# EXPOSE 8080
RUN npm install && \
    npm run build


# RUN IT!
ENTRYPOINT ["npm", "start"]
# CMD ["npm", "run", "start:dev"]
# ENTRYPOINT ["http-server","./build", "-p","8080"]
EXPOSE 8080


# CIA_API KEY --- this should go into the manifest file when I get there. keeping here for storage.
#  d82bdad781d7452d96be3b996883c8d6
# Team Name : tpc-fn
