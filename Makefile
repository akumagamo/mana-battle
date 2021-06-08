

generate-apk:
	rm -rf  deploy/dist/dist
	rm -rf  deploy/dist/assets
	cp index.html deploy/dist/index.html
	yarn deploy  
	cp -r dist/ deploy/dist
	cp -r assets/ deploy/dist
	cd deploy
	docker run --name mana-apkgen docker-mana 
	docker cp mana-apkgen:/mana/manabattle/platforms/android/app/build/outputs/apk/debug/app-debug.apk ./app.apk
	docker rm -f mana-apkgen

