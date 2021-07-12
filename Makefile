

generate-apk:
	rm -rf  deploy/web-bundle
	mkdir deploy/web-bundle
	cp index.html deploy/web-bundle/index.html
	yarn deploy  
	cp -r dist/ deploy/web-bundle
	cp -r assets/ deploy/web-bundle
	cd deploy
	docker run --name mana-apkgen docker-mana 
	docker cp mana-apkgen:/mana/manabattle/platforms/android/app/build/outputs/apk/debug/app-debug.apk ./app.apk
	docker rm -f mana-apkgen

