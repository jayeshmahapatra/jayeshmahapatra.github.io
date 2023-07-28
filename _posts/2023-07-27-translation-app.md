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
- `recognizeLanguage`: A public function that takes as input the `Map` created from our `performOCR` function during the OCR step, and returns a string indicating the Language detected. 

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

### Integrating with PreviewActivity
Now let's add logic to `PreviewActivity.kt` such we start Language Identification once the OCR is completed.

## Step 4: Language Translation
Create a class called Translator, to handle the text translation as well as management of the translation model. This class handles downloading the correct translation model (if required)
and then using the translation model to translate text to english. Since we support two source langauges (se/de) the class can download two translation models for se-en and de-en translations repsectively.

### Integrating with PreviewActivity
Now that our class is done, let's add the functionality to our app, such that Translation is automatically triggered after we finish with OCR.

## Step 5: Overlay results on the original captured image
Once we have the translation, we need to modify the original bitmap to overlay the translated text over the original image, while obstructing the original non-english text.
This is done by the textoverlay class.

## Github Repo: TranslateOCRApp
The full source code in is git at the link. You can either build the app using this or download a prebuilt apk to test the app out. the prebuilt apks can be found in the releases section.

