package com.textlegend.app

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Picture
import com.caverock.androidsvg.SVG
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap

fun svgToImageBitmap(svgContent: String, width: Int = 200, height: Int = 64): ImageBitmap? {
    return runCatching {
        val svg = SVG.getFromString(svgContent)
        val picture = svg.renderToPicture()
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.drawPicture(picture)
        bitmap.asImageBitmap()
    }.getOrNull()
}
