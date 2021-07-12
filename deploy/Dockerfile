FROM beevelop/cordova:latest

ADD . /mana

WORKDIR /mana

RUN cordova create manabattle com.compose.manabattle

WORKDIR /mana/manabattle

RUN cordova platform add android

CMD rm -rf www/* && \ 
    cp config.xml manabattle/config.xml && \ 
    mv web-bundle www && \
    cd manabattle && cordova build android 
