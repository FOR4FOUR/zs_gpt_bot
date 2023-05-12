run:
	docker run -d -p 3000:3000 --name zsgptbot --rm zsgptbot
build:
	docker build -t zsgptbot .