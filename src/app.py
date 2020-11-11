from flask import Flask, redirect, url_for
from PIL import Image

app = Flask(__name__)

# python3 -m flask run --port 9000 --no-debugger --no-reload
@app.route("/")
def hello():
    return app.send_static_file("index.html")


@app.route("/", methods=["POST"])
def receive_image():
    img = Image.open(request.files["file"])
    return "Success!"


import os
from flask import Flask, request
from inference import main

UPLOAD_FOLDER = "./sample_data"

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/foo")
def foo():
    return """
    <video src="/static/result_voice.mp4" controls></video>
    """


@app.route("/image", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        if "image" not in request.files:
            return "there is no image in form!"
        if "sound" not in request.files:
            return "there is no sound in form!"
        image = request.files["image"]
        sound = request.files["sound"]
        image = Image.open(image)
        path = os.path.join(app.config["UPLOAD_FOLDER"], "face.png")
        image.save(path)
        path = os.path.join(app.config["UPLOAD_FOLDER"], "sound.wav")
        sound.save(path)
        main(
            "./checkpoints/wav2lip_gan.pth",
            "./sample_data/face.png",
            "./sample_data/sound.wav",
            resize_factor=1,
            outfile="./static/result_voice.mp4",
        )

        return redirect(url_for("foo"))

    return app.send_static_file("index.html")