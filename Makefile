build:
	docker build --tag wav2lip:latest .
run:
	docker run --gpus all \
	--mount 'type=bind,source=$(CURDIR)/src,target=/usr/src/Wav2Lip' \
	wav2lip:latest \
	/bin/bash -c "python3 inference.py --checkpoint_path "./checkpoints/wav2lip_gan.pth" \
	--face "./sample_data/face.jpg" \
	--audio "./sample_data/input_audio.wav" \
	--resize_factor 2 \
	&& chown -R $$(id -g) ./results"