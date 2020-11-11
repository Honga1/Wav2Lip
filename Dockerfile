FROM nvidia/cuda:10.2-devel-ubuntu18.04

RUN apt-get update && apt-get install -y --no-install-recommends software-properties-common \
  libsm6 libxext6 libxrender-dev curl 

RUN echo "**** Installing Python ****" && \
  add-apt-repository ppa:deadsnakes/ppa &&  \
  apt-get install -y build-essential python3.6 python3.6-dev python3-pip && \
  curl -O https://bootstrap.pypa.io/get-pip.py && \
  python3.6 get-pip.py

RUN apt-get install -y ffmpeg libsndfile1

# check our python environment
RUN python3 --version
RUN pip3 --version

# set the working directory for containers
WORKDIR  /usr/src/Wav2Lip

# Installing python dependencies
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt