import os
from PIL import Image
from flask import Flask, request, redirect
from inference import main

app = Flask(__name__)
UPLOAD_FOLDER = "./sample_data"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# python3 -m flask run --port 9000 --no-debugger --no-reload
@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/upload_file", methods=["GET", "POST"])
def upload_file():
    if "image" not in request.files:
        return "there is no image in form!"
    if "sound" not in request.files:
        return "there is no sound in form!"
    image = request.files["image"]
    sound = request.files["sound"]
    path = os.path.join(app.config["UPLOAD_FOLDER"], image.filename)
    image.save(path)
    path = os.path.join(app.config["UPLOAD_FOLDER"], sound.filename)
    sound.save(path)
    main(
        "./checkpoints/wav2lip_gan.pth",
        "./sample_data/" + image.filename,
        "./sample_data/" + sound.filename,
        resize_factor=1,
        outfile="./static/result_voice.mp4",
    )

    return redirect(request.referrer)
