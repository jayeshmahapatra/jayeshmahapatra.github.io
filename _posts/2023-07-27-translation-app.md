##  Creating a OCR Translation App using Kotlin and Google ML-Kit
Tutorial to create a point and shoot translation app for android for translating Swedish/ German text to English.
Example gif of usage.
Assumes some basic familiarity with Android and Kotlin coding.
## Base App: Camera X Tutorial App
To build a point and shoot translation app, the first step is to build a camera functionality that allows the user to click pictures.
For android, a simple way to achieve this is by using the CameraX Jetpack library which simiplifies camera functionality development by providing a consistent, easy to use API.

So as a prerequisite for this tutorial, please go through the [Get Started with CameraX](https://developer.android.com/codelabs/camerax-getting-started#0) tutorial,
that will walk you through the process of creating a simple camera app. Since we only need image capture functionality, you can stop after Step 5 of the tutorial and skip
the rest that deals with video capture and image analysis.

Once you have completed the Camera X tutorial upto Step 5, you are ready the start this Translation App tutorial.


## Step 1: Adding an Extra Activity to the Base App
Does the following:
- Modify the main activity to capture and save picture in the app's directory
- Create a New Activity called Preview Activity that the app transitions to after the picture is captured.
The new view will display the captured image for now.
- Add logic in main activity to transition to preview activity once the picture is clicked and saved.

## Step 2: Doing OCR
Now that we have a an app where we can capture images and preview the captured image, let's get started with the translation.
We first start by implementing OCR functionality using ML-Kit to read any text present in the captured image. 

Before we start coding, it's important to add relevant ML-Kit ocr dependencies to our app's build.gradle

```
dependencies {
    
    // ML-Kit to recognize Latin script
    implementation 'com.google.mlkit:text-recognition:16.0.0'
}
```

Then, let's create a class called `OCRHelper`, which will manage all OCR functionality. We also create an member variable to store an instance
of TextRecognition Client. This instance will be used to perform text recognition, and we use the default options to create it as we want to recongize only latin characters.

```kotlin
package com.example.translateocrapp

import com.google.mlkit.vision.text.Text
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import com.google.mlkit.vision.text.TextRecognizerOptionsInterface
import com.google.mlkit.vision.text.latin.TextRecognizerOptions

class OcrHelper {
    private val textRecognizer: TextRecognizer
    private val textRecognizerOptions: TextRecognizerOptionsInterface

    init {
        textRecognizerOptions = TextRecognizerOptions.Builder().build()
        textRecognizer = TextRecognition.getClient(textRecognizerOptions)
    }
}
```

Now let's start adding OCR functionality to the class. To do this we will create two functions:

- `performOCR`: A public function that takes in a bitmap as input, does OCR, and returns the OCR results as a `Map<Rect, Text.Line>`. This map esseintially is a mapping between where the OCR text was found to the text that was found inside that region. `Text.Line` is a Class used by ML-Kit to store the recongized text along with supporting info like angle of the detected text.

- `extractTextBlocks`: A private function that takes in the result of OCR (A Text Class object), and restructures it into the `Map` structure required by the `performOCR` function.


```kotlin
    
    fun performOcr(bitmap: Bitmap): Map<Rect, Text.Line> {
        val image = InputImage.fromBitmap(bitmap, 0)
        val task: Task<Text> = textRecognizer.process(image)
        val result = Tasks.await(task)
        return extractTextBlocks(result)
    }

    private fun extractTextBlocks(text: Text): Map<Rect, Text.Line> {
        val lineMap = mutableMapOf<Rect, Text.Line>()

        for (textBlock in text.textBlocks) {
            for (line in textBlock.lines) {
                val rect = line.boundingBox

                if (rect != null) {
                    lineMap[rect] = line
                }
            }
        }

        return lineMap
    }

```

### Integrating with PreviewActivity
Now that our class is done, let's add the functionality to our app, such that OCR is triggered automatically
once PreviewActivity is created.


## Step 3: Identifying the Language
Once we have the results of the OCR, the next step we want to do is identify which language does the identified text
belong to. Since we plan to support only two languages Swedish and German, our language identification task essentially tells us if the text identified belongs to one of these two classes or something else.

We start by creating a class called `LanguageRecognizer`. We also add a member variable to store an instance of ML-Kit `LanguageIdentification` client, created using default options.

```kotlin
package com.example.translateocrapp

class LanguageRecognizer {

    private val languageIdentifierClient: LanguageIdentifier
    private val languageIdentifierOptions: LanguageIdentificationOptions

    init {
        // Initialize the language identifier client in the class constructor
        languageIdentifierOptions = LanguageIdentificationOptions.Builder()
            .setConfidenceThreshold(0.5f)
            .build()
        languageIdentifierClient = LanguageIdentification.getClient(languageIdentifierOptions)
    }
}


```
Now we add Language Identification functionality by adding a single public function:
- `recognizeLanguage`: A public function that takes as input the `Map` created from our `performOCR` function during the OCR step, and returns a string indicating the language detected. 

    The function iterates through all the OCR results and recognizes the language associated with each text line. Then returns the most common language found that is either German or Swedish. If neither of two is found, detected language is undetermined.

```kotlin
    
    fun recognizeLanguage(ocrMap: Map<Rect, Text.Line>): String {

        // Iterate through the map of OCR results and recognize the language of each line
        // Find the most common language that is either German or Swedish
        // if neither German nor Swedish is found, return "und"

        // Create a map to store the language of each line
        val languageMap = mutableMapOf<Rect, String>()

        // Iterate through the map of OCR results
        for ((rect, line) in ocrMap) {
            // Get the text from the line
            val text = line.text

            // Create a task to recognize the language of the line
            val task: Task<String> = languageIdentifierClient.identifyLanguage(text)

            // Wait for the task to complete
            val result = Tasks.await(task)

            // Store the language of the line in the map
            languageMap[rect] = result
        }

        // Count the occurrences of German and Swedish languages
        val germanCount = languageMap.values.count { it == "de" }
        val swedishCount = languageMap.values.count { it == "sv" }

        return when {
            germanCount > 0 && swedishCount > 0 -> {
                // Both German and Swedish are present, return the most common between them
                if (germanCount >= swedishCount) "de" else "sv"
            }
            germanCount > 0 -> "de" // Only German is present
            swedishCount > 0 -> "sv" // Only Swedish is present
            else -> "und" // Neither German nor Swedish is found
        }

    }

```

## Step 4: Language Translation
Now that OCR and language identification are taken care of, we can finally start translating ! Just like the previous steps, it's a good idea to separate out the code.

So we will start by creating a new class called `TextTranslator`. This time however, the class would be a little more complex.

- `Context`: For this class we would need a context variable, as we want to show toasts to user indicating different info.

- `Translator`: We will create two translators to translate to Englsh, one for German and one for Swedish.

- `RemoteModelManager`: We will create an instance of this to download needed translation models on the fly as needed.

- `AlertDialog`: An instance of this will be used to show download progress to the user.

```kotlin
package com.example.translateocrapp

import android.content.Context
import androidx.appcompat.app.AlertDialog

import com.google.mlkit.nl.translate.TranslateLanguage
import com.google.mlkit.nl.translate.TranslatorOptions

import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.common.model.RemoteModelManager
import com.google.mlkit.nl.translate.TranslateRemoteModel


class TextTranslator(private val context: Context) {

    // Variables
    private lateinit var germanOptions : TranslatorOptions
    private lateinit var germanTranslator : com.google.mlkit.nl.translate.Translator

    private lateinit var swedishOptions : TranslatorOptions
    private lateinit var swedishTranslator : com.google.mlkit.nl.translate.Translator

    private val remoteModelManager = RemoteModelManager.getInstance()

    // AlertDialog to show download progress
    private var progressDialog: AlertDialog? = null


    init {

        // Initialize the german translator
        germanOptions = TranslatorOptions.Builder()
            .setSourceLanguage(TranslateLanguage.GERMAN)
            .setTargetLanguage(TranslateLanguage.ENGLISH)
            .build()

        germanTranslator = com.google.mlkit.nl.translate.Translation.getClient(germanOptions)

        // Initialize the swedish translator
        swedishOptions = TranslatorOptions.Builder()
            .setSourceLanguage(TranslateLanguage.SWEDISH)
            .setTargetLanguage(TranslateLanguage.ENGLISH)
            .build()

        swedishTranslator = com.google.mlkit.nl.translate.Translation.getClient(swedishOptions)


    }
}
```

Now let's start adding the translation functionality. This will again involve methods to download and manage translation models, as well as methods to perform actual translation.

- `translateOcrResult`: This method takes as input the `Map` result of the `performOCR`, along with the language code generated by the `recognizeLanguage` and outputs a `Map<Rect,String>`. The output `Map` contains mapping from bitmap detected text region to translated text.

- `translateTextToEnglish`: This method does the actual translation of a string of text into another language.

- `isModelDownloaded`: This method checks if the phone already has translation model downloaded and stored locally.

- `downloadModel`: This method downloads the required translation model, in case they are not found to be stored in the device already.

- `showDownloadToast`: This method helps to handle toast message that's displayed to the User while we download the translation model.

```kotlin

 // Create a function to translate text
    // sourceLanguageCode is the language code can have two values: "sv" or "de"
    fun translateTextToEnglish(text: String, sourceLanguageCode: String): String {

        // Check if the source language code is "sv" or "de", if not return the text
        if (sourceLanguageCode != "sv" && sourceLanguageCode != "de") {
            return text
        }

        // Check if the translation model is downloaded and available
        if (!isModelDownloaded(sourceLanguageCode)) {
            // Model not downloaded, download it and wait for completion
            downloadModel(sourceLanguageCode)
        }

        // If the source language code is "sv" then translate the text to english using the swedish translator
        var task: Task<String> = if (sourceLanguageCode == "sv") {
            swedishTranslator.translate(text)

        }
        // If the source language code is "de" then translate the text to english using the german translator
        else {
            germanTranslator.translate(text)
        }

        return Tasks.await(task)

    }



    // Check if the translation model for the given language code is downloaded and available
    private fun isModelDownloaded(languageCode: String): Boolean {

        val model = TranslateRemoteModel.Builder(languageCode).build()
        val task = remoteModelManager.isModelDownloaded(model)
        return Tasks.await(task)

    }

    // Download the translation model for the given language code
    private fun downloadModel(languageCode: String) {

        // Create a progress dialog
        val progressBar = ProgressBar(context).apply {
            isIndeterminate = true
        }

        Handler(Looper.getMainLooper()).post {
            progressDialog = AlertDialog.Builder(context)
                .setTitle("Downloading Translation Model")
                .setCancelable(false)
                .setView(progressBar)
                .show()
        }



        val conditions = DownloadConditions.Builder()
            .requireWifi()
            .build()
        val model = TranslateRemoteModel.Builder(languageCode).build()
        val downloadTask = remoteModelManager.download(model, conditions)

        try {
            Tasks.await(downloadTask)
            Handler(Looper.getMainLooper()).post {
                progressDialog?.dismiss()
                progressDialog = null
            }

            // Show a toast indicating successful download
            showDownloadToast("Translation Model Downloaded Successfully")

        } catch (e: Exception) {

            // Dismiss the progress dialog on download failure
            Handler(Looper.getMainLooper()).post {
                progressDialog?.dismiss()
                progressDialog = null
            }

            // Show a toast indicating download failure
            showDownloadToast("Translation Model Download Failed")

        }
    }

    // Show toast on the main UI thread
    private fun showDownloadToast(message: String) {
        (context as? Activity)?.runOnUiThread {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    // Create a function to translate ocr result
    fun translateOcrResult(ocrResult: Map<Rect, Text.Line>, languageCode: String ): Map<Rect, String> {

        // Create a map to store the translated result
        val translatedResult = mutableMapOf<Rect, String>()

        // Iterate through the ocr result
        for ((rect, line) in ocrResult) {

            // Translate the line to english
            val translatedText = translateTextToEnglish(line.text, languageCode)

            // Add the translated text to the map
            translatedResult[rect] = translatedText
        }

        return translatedResult

    }

```

## Step 5: Overlay results on the original captured image
Once we have the translation of text, we need to annotate the text on top of the original bitmap.

To do this we create a new class called `BitmapAnnotator`. We create this class in the singleton pattern using the keyword `object`.

This class will have the following methods:

- `annotateBitmap`: This function will take as input the translated text and their location as well as the original captured bitmap, and output a modified bitmap with translated text overlayed on top of it.

## Github Repo: TranslateOCRApp
The full source code in is git at the link. You can either build the app using this or download a prebuilt apk to test the app out. the prebuilt apks can be found in the releases section.

