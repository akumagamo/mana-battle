FROM beevelop/cordova:latest

ADD ./dist /mana

WORKDIR /mana

RUN cordova create manabattle com.compose.manabattle

WORKDIR /mana/manabattle

RUN cordova platform add android

CMD rm -rf www/* && \ 
    cp /mana/config.xml /mana/manabattle/config.xml && \ 
    mv /mana/index.html /mana/manabattle/www/index.html && \ 
    mv /mana/assets/ /mana/manabattle/www/assets/ && \ 
    mv /mana/dist/ /mana/manabattle/www/dist && \ 
    cd /mana/manabattle && cordova build android 
