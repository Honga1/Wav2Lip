build:
	docker build --tag wav2lip:latest .
run:
	docker run --gpus all \
	--mount type=bind,source=$(CURDIR)/results,target=/usr/src/Wav2Lip/results \
	wav2lip:latest
	sudo chown -R $$(whoami) ./results