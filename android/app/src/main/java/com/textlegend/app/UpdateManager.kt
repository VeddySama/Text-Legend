package com.textlegend.app

import android.app.Activity
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject

class UpdateManager(private val context: Context) {
    private val client = OkHttpClient()

    data class UpdateInfo(
        val latestVersionCode: Int,
        val latestTag: String,
        val apkUrl: String,
        val name: String
    )

    suspend fun checkForUpdate(repo: String, currentVersionCode: Int): UpdateInfo? = withContext(Dispatchers.IO) {
        val url = "https://api.github.com/repos/$repo/releases/latest"
        val req = Request.Builder().url(url).build()
        client.newCall(req).execute().use { res ->
            if (!res.isSuccessful) return@withContext null
            val body = res.body?.string().orEmpty()
            val json = JSONObject(body)
            val tag = json.optString("tag_name", "")
            val versionCode = parseVersionCode(tag)
            if (versionCode <= currentVersionCode) return@withContext null
            val assets = json.optJSONArray("assets") ?: return@withContext null
            var apkUrl: String? = null
            var name = tag
            for (i in 0 until assets.length()) {
                val asset = assets.optJSONObject(i) ?: continue
                val assetName = asset.optString("name")
                if (assetName.endsWith(".apk")) {
                    apkUrl = asset.optString("browser_download_url")
                    name = assetName
                    break
                }
            }
            if (apkUrl.isNullOrBlank()) return@withContext null
            UpdateInfo(versionCode, tag, apkUrl, name)
        }
    }

    fun canRequestInstall(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.packageManager.canRequestPackageInstalls()
        } else {
            true
        }
    }

    fun requestInstallPermission(activity: Activity) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES)
                .setData(Uri.parse("package:${context.packageName}"))
            activity.startActivity(intent)
        }
    }

    fun downloadAndInstall(update: UpdateInfo): Long {
        val request = DownloadManager.Request(Uri.parse(update.apkUrl))
            .setTitle("更新 ${update.latestTag}")
            .setDescription("正在下载更新")
            .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, update.name)
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)

        val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        return dm.enqueue(request)
    }

    fun openDownloadedApk(downloadId: Long) {
        val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val uri = dm.getUriForDownloadedFile(downloadId) ?: return
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    companion object {
        fun parseVersionCode(tag: String): Int {
            val clean = tag.removePrefix("v").trim()
            val parts = clean.split(".")
            return parts.lastOrNull()?.toIntOrNull() ?: 0
        }
    }
}
