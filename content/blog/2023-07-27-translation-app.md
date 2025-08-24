---
title: "Android OCR Translation App using Kotlin and Google ML-Kit"
draft: false
date: "2023-07-27"
tags:
  - 
---
#  Android OCR Translation App using Kotlin and Google ML-Kit
Language translation has been revolutionary in reducing friction when interacting with people and services from foreign countries, and facilitates the flow of information across the globe. The recent advances in Machine Learning continue to make translation more accurate and efficient.

In my day to day life, I frequently use the text translation feature of [Google Lens](https://lens.google/) to translate documents to English.

Since I wanted to experiment in building Android native apps, I decided this would be an ideal side project with the perfect mixture of Android Native code and Machine Learning.

## Choosing the Tools

- **Programming Language**: While Android Native code can be written in both Java and Kotlin, I decided to stick to Kotlin completely to benefit from the modern features it offers like Null Safety and lambda expressions.

- **Camera Functionality**: For implementing the Camera and Image Capture functionality, I decided to go with [CameraX](https://developer.android.com/training/camerax) which is a Jetpack library that provides an easy to use Camera API for android devices.

- **Machine Learning**: For the Machine Learning side, I decided to go with [Google ML-Kit](https://developers.google.com/ml-kit) as a one stop solution for deploying On-device Machine Learning for common tasks. 

    The benefits of choosing ML-Kit were:

    - Ease of Use: The API is easy to use, and integrating it is a simple matter of adding dependencies to build.gradle

    - Functionalities: It offers varied range of ML services like OCR, Language Identificaiton and Translation that I can use to implement this app. This keeps the code base consistent and intercompatible.

## Designing the WorkFlow

The process flow can luckily be desinged in a simple linear fashion. 

The app works in the following steps:

1. **Capture Image:** The user can capture an image of the text using the camera functionality implemented in `MainActivity`. Upon capturing the image, it is saved for further processing.

2. **Optical Character Recognition (OCR):** After the image is captured, the `PreviewActivity` is launched, where the raw image is displayed. The app then utilizes Google ML Kit's OCR capabilities provided by the `OcrHelper` class to extract all the text present in the image.

3. **Language Identification:** Once the text is extracted using OCR, the `LanguageRecognizer` class is employed to identify the language of the extracted text. The app determines if the text is in Swedish, German, or an undetermined language.

4. **Translation:** Based on the identified language, the app decides which language translation model to use. The `TextTranslator` class handles the downloading and loading of the appropriate translation model (German if undetermined). The text is then translated into English. The class also manages translation models, such as downloading and storing them locally as needed.

5. **Image Transformation:** The original image, along with the overlay of the translated text, is displayed to the user in the `PreviewActivity`. The `BitmapAnnotator` class takes care of overlaying the translated text on top of the original image. This is done by blurring the original text and replacing them with their translations.

**Note**: The app needs wifi internet when it's used for the first time to download the translation models. After the first time, the app can work completely offline.

## Source Code and Apk

I have created a github repo called [`TranslateOCRApp`](https://github.com/jayeshmahapatra/TranslateOCRApp) that contains the source code for this app. This repository also contains a [`Releases`](https://github.com/jayeshmahapatra/TranslateOCRApp/releases) section from where you can download an apk of the App and try it out yourself.

## Example Usage

Point the camera at the text you want to translate and capture an image by clicking the capture button. After the capture, the app will translate the text and display an image with the translated text.

<figure>
    <img src="/media/2023-07-27-translation-app/translation_app_example_use.gif"
         alt="A gif of using the translation app to translate an advertisement poster"
         width = "270"
         height = "500">
    <figcaption>Translating an advertisement poster using the app</figcaption>
</figure>






