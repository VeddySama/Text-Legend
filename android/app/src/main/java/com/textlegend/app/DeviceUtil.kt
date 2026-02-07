package com.textlegend.app

import android.content.Context
import android.provider.Settings
import android.os.Build
import java.security.MessageDigest

fun computeDeviceFingerprint(context: Context): String {
    val androidId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: ""
    val raw = listOf(
        androidId,
        Build.MANUFACTURER ?: "",
        Build.MODEL ?: "",
        Build.BRAND ?: "",
        Build.DEVICE ?: "",
        Build.PRODUCT ?: "",
        Build.VERSION.SDK_INT.toString()
    ).joinToString("|")
    return sha256(raw)
}

private fun sha256(input: String): String {
    val md = MessageDigest.getInstance("SHA-256")
    val bytes = md.digest(input.toByteArray(Charsets.UTF_8))
    return bytes.joinToString("") { "%02x".format(it) }
}
